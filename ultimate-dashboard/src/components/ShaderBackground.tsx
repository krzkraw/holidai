import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BackgroundRendererMode,
  choosePreferredBackgroundRenderer,
  getAtmosphereState,
  normalizeScrollDepth,
  shouldRunContinuousBackgroundLoop
} from '../background';
import { ViewId } from '../model';

const GPU_BUFFER_USAGE_COPY_DST = 0x8;
const GPU_BUFFER_USAGE_UNIFORM = 0x40;
const GPU_TEXTURE_USAGE_RENDER_ATTACHMENT = 0x10;

type ShaderBackgroundProps = {
  activeView: ViewId;
};

type CanvasRenderer = {
  mode: Exclude<BackgroundRendererMode, 'static'>;
  renderOnce: () => void;
  pause: () => void;
  resume: () => void;
  destroy: () => void;
};

type WebGpuNavigator = Navigator & {
  gpu?: {
    requestAdapter: () => Promise<WebGpuAdapter | null>;
    getPreferredCanvasFormat: () => string;
  };
};

type WebGpuAdapter = {
  requestDevice: () => Promise<WebGpuDevice>;
};

type WebGpuDevice = {
  createShaderModule: (descriptor: { code: string }) => object;
  createRenderPipeline: (descriptor: object) => WebGpuRenderPipeline;
  createBuffer: (descriptor: { size: number; usage: number }) => WebGpuBuffer;
  createBindGroup: (descriptor: object) => object;
  createCommandEncoder: () => WebGpuCommandEncoder;
  queue: {
    writeBuffer: (buffer: WebGpuBuffer, bufferOffset: number, data: Float32Array) => void;
    submit: (commandBuffers: object[]) => void;
  };
};

type WebGpuRenderPipeline = {
  getBindGroupLayout: (index: number) => object;
};

type WebGpuBuffer = object;

type WebGpuCommandEncoder = {
  beginRenderPass: (descriptor: object) => WebGpuRenderPass;
  finish: () => object;
};

type WebGpuRenderPass = {
  setPipeline: (pipeline: WebGpuRenderPipeline) => void;
  setBindGroup: (index: number, bindGroup: object) => void;
  draw: (vertexCount: number) => void;
  end: () => void;
};

type WebGpuCanvasContext = {
  configure: (descriptor: object) => void;
  getCurrentTexture: () => {
    createView: () => object;
  };
};

const webGpuShader = `
struct Uniforms {
  resolution: vec2<f32>,
  time: f32,
  progress: f32,
  scrollDepth: f32,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4<f32> {
  var positions = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(3.0, -1.0),
    vec2<f32>(-1.0, 3.0)
  );

  return vec4<f32>(positions[vertexIndex], 0.0, 1.0);
}

fn hash(point: vec2<f32>) -> f32 {
  return fract(sin(dot(point, vec2<f32>(127.1, 311.7))) * 43758.5453);
}

fn noise(point: vec2<f32>) -> f32 {
  let cell = floor(point);
  let local = fract(point);
  let curve = local * local * (3.0 - 2.0 * local);

  return mix(
    mix(hash(cell), hash(cell + vec2<f32>(1.0, 0.0)), curve.x),
    mix(hash(cell + vec2<f32>(0.0, 1.0)), hash(cell + vec2<f32>(1.0, 1.0)), curve.x),
    curve.y
  );
}

@fragment
fn fragmentMain(@builtin(position) fragment: vec4<f32>) -> @location(0) vec4<f32> {
  let uv = fragment.xy / uniforms.resolution;
  let aspect = uniforms.resolution.x / uniforms.resolution.y;
  let scrollDepth = clamp(uniforms.scrollDepth, 0.0, 1.0);
  let sunArc = sin(uniforms.progress * 3.14159);
  let sun = vec2<f32>(
    0.14 + uniforms.progress * 0.72,
    0.34 + scrollDepth * 0.23 - sunArc * (0.07 - scrollDepth * 0.03)
  );
  let scaledUv = vec2<f32>(uv.x * aspect, uv.y);
  let scaledSun = vec2<f32>(sun.x * aspect, sun.y);
  let sunDistance = distance(scaledUv, scaledSun);
  let vertical = smoothstep(0.0, 1.0, uv.y);
  let sunRadius = mix(0.165, 0.042, scrollDepth);
  let sunInnerRadius = sunRadius * mix(0.38, 0.48, scrollDepth);
  let sunGlowFalloff = mix(2.25, 7.1, scrollDepth);
  let sunGlowStrength = mix(0.98, 0.34, scrollDepth);
  let sunDiscStrength = mix(0.96, 0.62, scrollDepth);
  let skyExposure = mix(1.18, 0.7, scrollDepth);

  var color = mix(vec3<f32>(0.035, 0.045, 0.085), vec3<f32>(0.39, 0.18, 0.13), vertical);
  color = mix(color, vec3<f32>(0.08, 0.095, 0.14), smoothstep(0.66, 1.0, uv.y) * 0.42);

  let sunDisc = smoothstep(sunRadius, sunInnerRadius, sunDistance);
  let sunGlow = exp(-sunDistance * sunGlowFalloff);
  color += vec3<f32>(1.0, 0.43, 0.17) * sunGlow * sunGlowStrength;
  color = mix(color, vec3<f32>(1.0, 0.72, 0.39), sunDisc * sunDiscStrength);

  let fogA = noise(vec2<f32>(uv.x * 2.15 + uniforms.time * 0.022 + uniforms.progress * 0.35, uv.y * 5.2));
  let fogB = noise(vec2<f32>(uv.x * 6.4 - uniforms.time * 0.036, uv.y * 2.35 + 4.0));
  let lowFog = smoothstep(0.32, 0.93, uv.y) * smoothstep(0.28, 0.82, fogA * 0.62 + fogB * 0.38);
  let horizonVeil = smoothstep(0.26, 0.58, uv.y) * (1.0 - smoothstep(0.88, 1.0, uv.y));
  let mist = lowFog * 0.38 + horizonVeil * 0.18;
  color = mix(color, vec3<f32>(0.67, 0.69, 0.68), mist);

  let grain = noise(fragment.xy * 0.58 + uniforms.time * 0.25) * 0.026;
  let vignette = smoothstep(0.92, 0.22, distance(uv, vec2<f32>(0.5, 0.54)));
  color = color * (0.72 + vignette * 0.42) + grain;
  color = color * skyExposure;
  color = mix(color, vec3<f32>(0.018, 0.024, 0.046), scrollDepth * 0.28);

  return vec4<f32>(pow(color, vec3<f32>(0.92)), 1.0);
}
`;

const webGlVertexShader = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const webGlFragmentShader = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_progress;
uniform float u_scroll_depth;
varying vec2 v_uv;

float hash(vec2 point) {
  return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 point) {
  vec2 cell = floor(point);
  vec2 local = fract(point);
  vec2 curve = local * local * (3.0 - 2.0 * local);

  return mix(
    mix(hash(cell), hash(cell + vec2(1.0, 0.0)), curve.x),
    mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0, 1.0)), curve.x),
    curve.y
  );
}

void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.x / u_resolution.y;
  float scrollDepth = clamp(u_scroll_depth, 0.0, 1.0);
  float sunArc = sin(u_progress * 3.14159);
  vec2 sun = vec2(
    0.14 + u_progress * 0.72,
    0.34 + scrollDepth * 0.23 - sunArc * (0.07 - scrollDepth * 0.03)
  );
  float sunDistance = distance(vec2(uv.x * aspect, uv.y), vec2(sun.x * aspect, sun.y));
  float vertical = smoothstep(0.0, 1.0, uv.y);
  float sunRadius = mix(0.165, 0.042, scrollDepth);
  float sunInnerRadius = sunRadius * mix(0.38, 0.48, scrollDepth);
  float sunGlowFalloff = mix(2.25, 7.1, scrollDepth);
  float sunGlowStrength = mix(0.98, 0.34, scrollDepth);
  float sunDiscStrength = mix(0.96, 0.62, scrollDepth);
  float skyExposure = mix(1.18, 0.7, scrollDepth);

  vec3 color = mix(vec3(0.035, 0.045, 0.085), vec3(0.39, 0.18, 0.13), vertical);
  color = mix(color, vec3(0.08, 0.095, 0.14), smoothstep(0.66, 1.0, uv.y) * 0.42);

  float sunDisc = smoothstep(sunRadius, sunInnerRadius, sunDistance);
  float sunGlow = exp(-sunDistance * sunGlowFalloff);
  color += vec3(1.0, 0.43, 0.17) * sunGlow * sunGlowStrength;
  color = mix(color, vec3(1.0, 0.72, 0.39), sunDisc * sunDiscStrength);

  float fogA = noise(vec2(uv.x * 2.15 + u_time * 0.022 + u_progress * 0.35, uv.y * 5.2));
  float fogB = noise(vec2(uv.x * 6.4 - u_time * 0.036, uv.y * 2.35 + 4.0));
  float lowFog = smoothstep(0.32, 0.93, uv.y) * smoothstep(0.28, 0.82, fogA * 0.62 + fogB * 0.38);
  float horizonVeil = smoothstep(0.26, 0.58, uv.y) * (1.0 - smoothstep(0.88, 1.0, uv.y));
  float mist = lowFog * 0.38 + horizonVeil * 0.18;
  color = mix(color, vec3(0.67, 0.69, 0.68), mist);

  float grain = noise(gl_FragCoord.xy * 0.58 + u_time * 0.25) * 0.026;
  float vignette = smoothstep(0.92, 0.22, distance(uv, vec2(0.5, 0.54)));
  color = color * (0.72 + vignette * 0.42) + grain;
  color = color * skyExposure;
  color = mix(color, vec3(0.018, 0.024, 0.046), scrollDepth * 0.28);

  gl_FragColor = vec4(pow(color, vec3(0.92)), 1.0);
}
`;

export function ShaderBackground({ activeView }: ShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const progressRef = useRef(getAtmosphereState(activeView).progress);
  const scrollDepthRef = useRef(0);
  const prefersReducedMotionRef = useRef(false);
  const [mode, setMode] = useState<BackgroundRendererMode>('static');
  const targetProgress = useMemo(() => getAtmosphereState(activeView).progress, [activeView]);

  const applyRendererPolicy = (renderer = rendererRef.current) => {
    if (!renderer) {
      return;
    }

    if (
      shouldRunContinuousBackgroundLoop({
        visibilityState: document.visibilityState,
        prefersReducedMotion: prefersReducedMotionRef.current,
      })
    ) {
      renderer.resume();
      return;
    }

    renderer.pause();

    if (document.visibilityState === 'visible') {
      renderer.renderOnce();
    }
  };

  const renderOnceWhenLoopIsPaused = () => {
    const renderer = rendererRef.current;

    if (
      renderer &&
      document.visibilityState === 'visible' &&
      !shouldRunContinuousBackgroundLoop({
        visibilityState: document.visibilityState,
        prefersReducedMotion: prefersReducedMotionRef.current,
      })
    ) {
      renderer.renderOnce();
    }
  };

  useEffect(() => {
    progressRef.current = targetProgress;
    renderOnceWhenLoopIsPaused();
  }, [targetProgress]);

  useEffect(() => {
    const updateScrollDepth = () => {
      scrollDepthRef.current = getWindowScrollDepth();
      renderOnceWhenLoopIsPaused();
    };

    updateScrollDepth();

    window.addEventListener('scroll', updateScrollDepth, { passive: true });
    window.addEventListener('resize', updateScrollDepth);

    return () => {
      window.removeEventListener('scroll', updateScrollDepth);
      window.removeEventListener('resize', updateScrollDepth);
    };
  }, []);

  useEffect(() => {
    let disposed = false;
    let renderer: CanvasRenderer | null = null;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotionRef.current = motionQuery.matches;

    const handleVisibilityChange = () => {
      applyRendererPolicy();
    };

    const handleMotionChange = (event: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = event.matches;
      applyRendererPolicy();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    motionQuery.addEventListener('change', handleMotionChange);

    const initialize = async () => {
      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      renderer = await createRenderer(canvas, () => progressRef.current, () => scrollDepthRef.current);

      if (disposed) {
        renderer?.destroy();
        return;
      }

      if (renderer) {
        rendererRef.current = renderer;
        applyRendererPolicy(renderer);
        setMode(renderer.mode);
      } else {
        setMode('static');
      }
    };

    void initialize();

    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      motionQuery.removeEventListener('change', handleMotionChange);
      rendererRef.current = null;
      renderer?.destroy();
    };
  }, []);

  return (
    <div className={`shader-background shader-background--${mode}`} data-renderer={mode} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}

async function createRenderer(
  canvas: HTMLCanvasElement,
  getTargetProgress: () => number,
  getTargetScrollDepth: () => number,
): Promise<CanvasRenderer | null> {
  const gpu = (navigator as WebGpuNavigator).gpu;
  const preferredMode = choosePreferredBackgroundRenderer({
    webgpu: Boolean(gpu),
    webgl: hasWebGlSupport()
  });

  if (preferredMode === 'webgpu') {
    try {
      return await createWebGpuRenderer(canvas, getTargetProgress, getTargetScrollDepth);
    } catch {
      // Fall through to the small WebGL shader; static CSS remains underneath both paths.
    }
  }

  if (preferredMode !== 'static') {
    try {
      return createWebGlRenderer(canvas, getTargetProgress, getTargetScrollDepth);
    } catch {
      return null;
    }
  }

  return null;
}

function hasWebGlSupport() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

async function createWebGpuRenderer(
  canvas: HTMLCanvasElement,
  getTargetProgress: () => number,
  getTargetScrollDepth: () => number,
): Promise<CanvasRenderer> {
  const gpu = (navigator as WebGpuNavigator).gpu;

  if (!gpu) {
    throw new Error('WebGPU is not available.');
  }

  const adapter = await gpu.requestAdapter();

  if (!adapter) {
    throw new Error('WebGPU adapter is not available.');
  }

  const device = await adapter.requestDevice();
  const context = canvas.getContext('webgpu') as unknown as WebGpuCanvasContext | null;

  if (!context) {
    throw new Error('WebGPU canvas context is not available.');
  }

  const format = gpu.getPreferredCanvasFormat();

  context.configure({
    device,
    format,
    alphaMode: 'opaque',
    usage: GPU_TEXTURE_USAGE_RENDER_ATTACHMENT
  });

  const shaderModule = device.createShaderModule({ code: webGpuShader });
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: shaderModule,
      entryPoint: 'vertexMain'
    },
    fragment: {
      module: shaderModule,
      entryPoint: 'fragmentMain',
      targets: [{ format }]
    },
    primitive: {
      topology: 'triangle-list'
    }
  });
  const uniformBuffer = device.createBuffer({
    size: 32,
    usage: GPU_BUFFER_USAGE_UNIFORM | GPU_BUFFER_USAGE_COPY_DST
  });
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: uniformBuffer
        }
      }
    ]
  });
  const uniformValues = new Float32Array(8);

  return createAnimationLoop('webgpu', canvas, getTargetProgress, getTargetScrollDepth, (time, progress, scrollDepth) => {
    const { width, height } = resizeCanvas(canvas);
    uniformValues[0] = width;
    uniformValues[1] = height;
    uniformValues[2] = time;
    uniformValues[3] = progress;
    uniformValues[4] = scrollDepth;
    device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          loadOp: 'clear',
          clearValue: { r: 0.03, g: 0.04, b: 0.07, a: 1 },
          storeOp: 'store'
        }
      ]
    });

    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(3);
    pass.end();
    device.queue.submit([encoder.finish()]);
  });
}

function createWebGlRenderer(
  canvas: HTMLCanvasElement,
  getTargetProgress: () => number,
  getTargetScrollDepth: () => number,
): CanvasRenderer {
  const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');

  if (!gl) {
    throw new Error('WebGL is not available.');
  }

  const program = createWebGlProgram(gl, webGlVertexShader, webGlFragmentShader);
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const timeLocation = gl.getUniformLocation(program, 'u_time');
  const progressLocation = gl.getUniformLocation(program, 'u_progress');
  const scrollDepthLocation = gl.getUniformLocation(program, 'u_scroll_depth');
  const buffer = gl.createBuffer();

  if (!buffer || !resolutionLocation || !timeLocation || !progressLocation || !scrollDepthLocation) {
    throw new Error('WebGL shader uniforms are not available.');
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  return createAnimationLoop('webgl', canvas, getTargetProgress, getTargetScrollDepth, (time, progress, scrollDepth) => {
    const { width, height } = resizeCanvas(canvas);

    gl.viewport(0, 0, width, height);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(resolutionLocation, width, height);
    gl.uniform1f(timeLocation, time);
    gl.uniform1f(progressLocation, progress);
    gl.uniform1f(scrollDepthLocation, scrollDepth);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  });
}

function createAnimationLoop(
  mode: Exclude<BackgroundRendererMode, 'static'>,
  canvas: HTMLCanvasElement,
  getTargetProgress: () => number,
  getTargetScrollDepth: () => number,
  render: (time: number, progress: number, scrollDepth: number) => void,
): CanvasRenderer {
  let frameId = 0;
  let currentProgress = getTargetProgress();
  let currentScrollDepth = getTargetScrollDepth();
  const startTime = performance.now();

  const renderFrame = (now: number, animated: boolean) => {
    const targetProgress = getTargetProgress();
    const targetScrollDepth = getTargetScrollDepth();

    if (animated) {
      currentProgress += (targetProgress - currentProgress) * 0.045;
      currentScrollDepth += (targetScrollDepth - currentScrollDepth) * 0.08;
      render((now - startTime) / 1000, currentProgress, currentScrollDepth);
      return;
    }

    currentProgress = targetProgress;
    currentScrollDepth = targetScrollDepth;
    render(0, currentProgress, currentScrollDepth);
  };

  const tick = (now: number) => {
    renderFrame(now, true);
    frameId = window.requestAnimationFrame(tick);
  };

  return {
    mode,
    renderOnce: () => {
      resizeCanvas(canvas);
      renderFrame(performance.now(), false);
    },
    pause: () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    },
    resume: () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(tick);
    },
    destroy: () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    }
  };
}

function getWindowScrollDepth(): number {
  const documentElement = document.documentElement;
  const documentHeight = Math.max(documentElement.scrollHeight, document.body.scrollHeight);

  return normalizeScrollDepth(window.scrollY, window.innerHeight, documentHeight);
}

function resizeCanvas(canvas: HTMLCanvasElement) {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.floor(canvas.clientWidth * pixelRatio));
  const height = Math.max(1, Math.floor(canvas.clientHeight * pixelRatio));

  if (canvas.width !== width) {
    canvas.width = width;
  }

  if (canvas.height !== height) {
    canvas.height = height;
  }

  return { width, height };
}

function createWebGlProgram(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string,
) {
  const vertexShader = compileWebGlShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileWebGlShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();

  if (!program) {
    throw new Error('WebGL program could not be created.');
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? 'WebGL program could not be linked.');
  }

  return program;
}

function compileWebGlShader(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);

  if (!shader) {
    throw new Error('WebGL shader could not be created.');
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? 'WebGL shader could not be compiled.');
  }

  return shader;
}
