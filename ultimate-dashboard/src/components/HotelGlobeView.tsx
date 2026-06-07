import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

import { BookingJson } from '../data/bookings';
import {
  GlobeMarker,
  getHotelGlobeMarkers,
  getMarkerPresentation,
  getSphericalFocus,
  latLonToUnitVector,
  UnitVector3,
} from '../globe';
import { DESTINATION_PROFILES, DestinationKey } from '../model';

const GPU_BUFFER_USAGE_COPY_DST = 0x8;
const GPU_BUFFER_USAGE_UNIFORM = 0x40;
const GPU_TEXTURE_USAGE_RENDER_ATTACHMENT = 0x10;
const FOV_RADIANS = 38 * (Math.PI / 180);
const MIN_CAMERA_DISTANCE = 1.48;
const MAX_CAMERA_DISTANCE = 7.2;

type HotelGlobeViewProps = {
  bookings: readonly BookingJson[];
  destination: DestinationKey;
  selectedLength: string;
  selectedVariant: string;
  onBackToHotels: () => void;
};

type CameraState = {
  yaw: number;
  pitch: number;
  distance: number;
};

type MarkerRenderData = GlobeMarker & {
  position: UnitVector3;
};

type MarkerPlacement = GlobeMarker & {
  x: number;
  y: number;
  mode: ReturnType<typeof getMarkerPresentation>['mode'];
  scale: number;
};

type GlobeRenderer = {
  mode: 'webgpu';
  start: () => void;
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

const globeShader = `
struct Uniforms {
  resolution: vec2<f32>,
  time: f32,
  distance: f32,
  yaw: f32,
  pitch: f32,
  markerGlow: f32,
  padding: f32,
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

fn hash(point: vec3<f32>) -> f32 {
  return fract(sin(dot(point, vec3<f32>(127.1, 311.7, 74.7))) * 43758.5453);
}

fn noise(point: vec3<f32>) -> f32 {
  let cell = floor(point);
  let local = fract(point);
  let curve = local * local * (3.0 - 2.0 * local);

  let n000 = hash(cell + vec3<f32>(0.0, 0.0, 0.0));
  let n100 = hash(cell + vec3<f32>(1.0, 0.0, 0.0));
  let n010 = hash(cell + vec3<f32>(0.0, 1.0, 0.0));
  let n110 = hash(cell + vec3<f32>(1.0, 1.0, 0.0));
  let n001 = hash(cell + vec3<f32>(0.0, 0.0, 1.0));
  let n101 = hash(cell + vec3<f32>(1.0, 0.0, 1.0));
  let n011 = hash(cell + vec3<f32>(0.0, 1.0, 1.0));
  let n111 = hash(cell + vec3<f32>(1.0, 1.0, 1.0));

  let nx00 = mix(n000, n100, curve.x);
  let nx10 = mix(n010, n110, curve.x);
  let nx01 = mix(n001, n101, curve.x);
  let nx11 = mix(n011, n111, curve.x);
  let nxy0 = mix(nx00, nx10, curve.y);
  let nxy1 = mix(nx01, nx11, curve.y);

  return mix(nxy0, nxy1, curve.z);
}

fn fbm(point: vec3<f32>) -> f32 {
  var value = 0.0;
  var amplitude = 0.5;
  var frequency = 1.0;

  for (var index = 0; index < 5; index = index + 1) {
    value = value + noise(point * frequency) * amplitude;
    frequency = frequency * 2.03;
    amplitude = amplitude * 0.52;
  }

  return value;
}

fn cameraPosition() -> vec3<f32> {
  let cp = cos(uniforms.pitch);
  return vec3<f32>(
    sin(uniforms.yaw) * cp,
    sin(uniforms.pitch),
    cos(uniforms.yaw) * cp
  ) * uniforms.distance;
}

fn cameraRight(forward: vec3<f32>) -> vec3<f32> {
  let worldUp = vec3<f32>(0.0, 1.0, 0.0);
  let candidate = cross(worldUp, forward);
  let fallback = vec3<f32>(1.0, 0.0, 0.0);

  if (length(candidate) < 0.001) {
    return fallback;
  }

  return normalize(candidate);
}

fn colorEarth(normal: vec3<f32>, viewDirection: vec3<f32>, time: f32) -> vec3<f32> {
  let latitude = asin(normal.y);
  let longitude = atan2(normal.x, normal.z);
  let continental =
    sin(longitude * 2.1 + sin(latitude * 3.3) * 1.6) * 0.44 +
    sin(longitude * 5.7 - latitude * 1.9) * 0.22 +
    sin((normal.x + normal.z) * 10.0 + normal.y * 4.0) * 0.16 +
    fbm(normal * 4.8) * 0.62;
  let warmBelt = smoothstep(-0.88, 0.15, latitude) * (1.0 - smoothstep(0.94, 1.24, latitude));
  let land = smoothstep(0.48, 0.62, continental + warmBelt * 0.23);
  let polar = smoothstep(1.12, 1.34, abs(latitude));
  let shelf = smoothstep(0.48, 0.62, continental + warmBelt * 0.23) - smoothstep(0.62, 0.75, continental + warmBelt * 0.23);
  let shallow = vec3<f32>(0.04, 0.46, 0.62);
  let ocean = mix(vec3<f32>(0.012, 0.09, 0.23), shallow, shelf * 0.55 + pow(max(normal.y * 0.4 + 0.6, 0.0), 2.0) * 0.18);
  let green = vec3<f32>(0.08, 0.37, 0.22);
  let sand = vec3<f32>(0.72, 0.54, 0.27);
  let highland = vec3<f32>(0.43, 0.34, 0.23);
  let landColor = mix(green, sand, smoothstep(-0.3, 0.7, sin(latitude * 2.6) + fbm(normal * 9.0)));
  let terrain = mix(landColor, highland, smoothstep(0.72, 0.98, fbm(normal * 14.0)));
  let clouds = smoothstep(0.57, 0.78, fbm(normal * 6.4 + vec3<f32>(time * 0.035, 0.0, -time * 0.018)));
  let latitudeGrid = 1.0 - smoothstep(0.0, 0.012, abs(fract((latitude + 1.5708) / 0.1745) - 0.5));
  let longitudeGrid = 1.0 - smoothstep(0.0, 0.01, abs(fract((longitude + 3.14159) / 0.2618) - 0.5));
  let grid = max(latitudeGrid, longitudeGrid) * 0.13;
  let sunDirection = normalize(vec3<f32>(-0.35, 0.4, 0.82));
  let diffuse = clamp(dot(normal, sunDirection), 0.0, 1.0);
  let night = smoothstep(0.03, 0.36, diffuse);
  let rim = pow(1.0 - max(dot(normal, viewDirection), 0.0), 2.4);

  var color = mix(ocean, terrain, land);
  color = mix(color, vec3<f32>(0.9, 0.95, 1.0), clouds * 0.34);
  color = mix(color, vec3<f32>(0.86, 0.92, 0.98), polar);
  color = color * (0.28 + diffuse * 0.86) * (0.42 + night * 0.58);
  color = color + vec3<f32>(0.14, 0.36, 0.7) * rim * 0.42;
  color = color + vec3<f32>(0.6, 0.85, 1.0) * grid;

  return color;
}

@fragment
fn fragmentMain(@builtin(position) fragment: vec4<f32>) -> @location(0) vec4<f32> {
  let resolution = max(uniforms.resolution, vec2<f32>(1.0, 1.0));
  var ndc = vec2<f32>(
    fragment.x / resolution.x * 2.0 - 1.0,
    1.0 - fragment.y / resolution.y * 2.0
  );
  ndc.x = ndc.x * (resolution.x / resolution.y);

  let camera = cameraPosition();
  let forward = normalize(-camera);
  let right = cameraRight(forward);
  let up = normalize(cross(forward, right));
  let tanHalfFov = tan(0.33161256);
  let ray = normalize(forward + right * ndc.x * tanHalfFov + up * ndc.y * tanHalfFov);
  let b = dot(camera, ray);
  let c = dot(camera, camera) - 1.0;
  let discriminant = b * b - c;
  let starSeed = hash(vec3<f32>(floor(fragment.xy * 0.55), 3.0));
  let stars = step(0.994, starSeed) * (0.32 + hash(vec3<f32>(floor(fragment.xy * 0.23), 9.0)) * 0.68);
  let background = vec3<f32>(0.005, 0.012, 0.035) + vec3<f32>(stars * 0.76);

  if (discriminant < 0.0) {
    let closest = sqrt(max(dot(camera, camera) - b * b, 0.0));
    let atmosphere = smoothstep(1.22, 1.0, closest) * smoothstep(-0.4, 0.2, -b);
    let vignette = smoothstep(1.35, 0.18, length(ndc * vec2<f32>(0.72, 1.0)));
    let spaceGlow = vec3<f32>(0.05, 0.18, 0.34) * vignette + vec3<f32>(0.25, 0.58, 0.9) * atmosphere * 0.45;

    return vec4<f32>(background + spaceGlow, 1.0);
  }

  let t = -b - sqrt(discriminant);
  let hit = camera + ray * t;
  let normal = normalize(hit);
  let viewDirection = normalize(camera - hit);
  let color = colorEarth(normal, viewDirection, uniforms.time);

  return vec4<f32>(pow(color, vec3<f32>(0.9)), 1.0);
}
`;

export function HotelGlobeView({
  bookings,
  destination,
  selectedLength,
  selectedVariant,
  onBackToHotels,
}: HotelGlobeViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraRef = useRef<CameraState>({ yaw: 0, pitch: 0, distance: 5.8 });
  const autoZoomRef = useRef({ startedAt: 0, active: true });
  const [rendererMode, setRendererMode] = useState<'loading' | 'webgpu' | 'unavailable'>('loading');
  const [rendererError, setRendererError] = useState<string | null>(null);
  const [placements, setPlacements] = useState<readonly MarkerPlacement[]>([]);
  const profile = DESTINATION_PROFILES[destination];
  const markers = useMemo(
    () =>
      getHotelGlobeMarkers(bookings, {
        destination,
        selectedVariant,
        selectedStayDays: selectedLength,
      }),
    [bookings, destination, selectedLength, selectedVariant],
  );
  const markerRenderData = useMemo(
    () =>
      markers.map((marker) => ({
        ...marker,
        position: latLonToUnitVector(marker.latitude, marker.longitude),
      })),
    [markers],
  );
  const focus = useMemo(() => getSphericalFocus(markers), [markers]);

  useEffect(() => {
    cameraRef.current = {
      yaw: focus.yaw,
      pitch: focus.pitch,
      distance: focus.startDistance,
    };
    autoZoomRef.current = {
      startedAt: performance.now(),
      active: true,
    };
  }, [focus]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    const stopAutoZoom = () => {
      autoZoomRef.current.active = false;
    };

    const handlePointerDown = (event: PointerEvent) => {
      isDragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      stopAutoZoom();
      canvas.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging) {
        return;
      }

      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      cameraRef.current = {
        ...cameraRef.current,
        yaw: cameraRef.current.yaw - dx * 0.006,
        pitch: clamp(cameraRef.current.pitch + dy * 0.005, -1.28, 1.28),
      };
    };

    const handlePointerUp = (event: PointerEvent) => {
      isDragging = false;
      canvas.releasePointerCapture(event.pointerId);
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      stopAutoZoom();
      const zoomFactor = Math.exp(event.deltaY * 0.0012);
      cameraRef.current = {
        ...cameraRef.current,
        distance: clamp(cameraRef.current.distance * zoomFactor, MIN_CAMERA_DISTANCE, MAX_CAMERA_DISTANCE),
      };
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, []);

  useEffect(() => {
    let disposed = false;
    let renderer: GlobeRenderer | null = null;

    const initialize = async () => {
      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      setRendererMode('loading');
      setRendererError(null);

      try {
        renderer = await createWebGpuGlobeRenderer(
          canvas,
          () => cameraRef.current,
          () => autoZoomRef.current,
          focus,
          markerRenderData,
          setPlacements,
        );

        if (disposed) {
          renderer.destroy();
          return;
        }

        renderer.start();
        setRendererMode(renderer.mode);
      } catch (error) {
        if (!disposed) {
          setRendererMode('unavailable');
          setRendererError(error instanceof Error ? error.message : 'WebGPU jest niedostępne.');
          setPlacements([]);
        }
      }
    };

    void initialize();

    return () => {
      disposed = true;
      renderer?.destroy();
    };
  }, [focus, markerRenderData]);

  return (
    <div className="hotel-globe" style={{ '--accent': profile.accent } as CSSProperties}>
      <header className="hotel-globe-header">
        <div>
          <span className="booking-kicker">WebGPU hotel globe</span>
          <h2>{profile.displayName}: mapa 3D hoteli</h2>
          <p>
            Autozoom z orbity do współrzędnych aktywnej listy. Po animacji przeciągnij kulę myszką i użyj scrolla,
            żeby zmienić dystans kamery.
          </p>
        </div>
        <div className="hotel-globe-header-actions">
          <span>{selectedLength} dni</span>
          <span>{selectedVariant}</span>
          <button type="button" onClick={onBackToHotels}>
            Wróć do listy
          </button>
        </div>
      </header>

      <div className="hotel-globe-stage" aria-label={`${profile.displayName} trójwymiarowa kula ziemska z hotelami`}>
        <canvas className="hotel-globe-canvas" ref={canvasRef} />
        <div className="hotel-globe-marker-layer" aria-label="Pinezki hoteli">
          {placements.map((placement) => (
            <span
              key={placement.id}
              className={`hotel-globe-marker hotel-globe-marker--${placement.mode}`}
              style={
                {
                  left: `${placement.x}px`,
                  top: `${placement.y}px`,
                  '--marker-scale': placement.scale,
                  '--accent': placement.accent,
                } as CSSProperties
              }
              title={`${placement.name}: ${placement.priceText}`}
              aria-label={`${placement.name}: ${placement.priceText}`}
            >
              {placement.mode === 'price' ? (
                <>
                  <strong>{placement.priceText}</strong>
                  <small>{placement.name}</small>
                </>
              ) : null}
            </span>
          ))}
        </div>
        <div className="hotel-globe-status">
          <span>{rendererMode === 'webgpu' ? 'WebGPU aktywne' : rendererMode === 'loading' ? 'Uruchamiam WebGPU' : 'WebGPU niedostępne'}</span>
          <strong>{markers.length} pinezek</strong>
        </div>
        {rendererMode === 'unavailable' ? (
          <div className="hotel-globe-fallback" role="status">
            <strong>Nie udało się uruchomić WebGPU.</strong>
            <span>{rendererError}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

async function createWebGpuGlobeRenderer(
  canvas: HTMLCanvasElement,
  getCamera: () => CameraState,
  getAutoZoom: () => { startedAt: number; active: boolean },
  focus: { yaw: number; pitch: number; startDistance: number; targetDistance: number },
  markers: readonly MarkerRenderData[],
  setPlacements: (placements: readonly MarkerPlacement[]) => void,
): Promise<GlobeRenderer> {
  const gpu = (navigator as WebGpuNavigator).gpu;

  if (!gpu) {
    throw new Error('Ta przeglądarka nie udostępnia navigator.gpu.');
  }

  const adapter = await gpu.requestAdapter();

  if (!adapter) {
    throw new Error('Nie udało się pobrać adaptera WebGPU.');
  }

  const device = await adapter.requestDevice();
  const context = canvas.getContext('webgpu') as unknown as WebGpuCanvasContext | null;

  if (!context) {
    throw new Error('Canvas nie obsługuje kontekstu webgpu.');
  }

  const format = gpu.getPreferredCanvasFormat();

  context.configure({
    device,
    format,
    alphaMode: 'opaque',
    usage: GPU_TEXTURE_USAGE_RENDER_ATTACHMENT,
  });

  const shaderModule = device.createShaderModule({ code: globeShader });
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: shaderModule,
      entryPoint: 'vertexMain',
    },
    fragment: {
      module: shaderModule,
      entryPoint: 'fragmentMain',
      targets: [{ format }],
    },
    primitive: {
      topology: 'triangle-list',
    },
  });
  const uniformBuffer = device.createBuffer({
    size: 32,
    usage: GPU_BUFFER_USAGE_UNIFORM | GPU_BUFFER_USAGE_COPY_DST,
  });
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: uniformBuffer,
        },
      },
    ],
  });
  const uniforms = new Float32Array(8);
  const startTime = performance.now();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let frameId = 0;

  const render = (now: number) => {
    const size = resizeCanvas(canvas);
    const camera = getCamera();
    const autoZoom = getAutoZoom();

    if (autoZoom.active) {
      const elapsed = reduceMotion ? 1 : clamp((now - autoZoom.startedAt) / 2600, 0, 1);
      const eased = easeOutCubic(elapsed);
      camera.yaw = lerpAngle(focus.yaw, focus.yaw, eased);
      camera.pitch = lerp(focus.pitch, focus.pitch, eased);
      camera.distance = lerp(focus.startDistance, focus.targetDistance, eased);

      if (elapsed >= 1) {
        autoZoom.active = false;
      }
    }

    uniforms[0] = size.pixelWidth;
    uniforms[1] = size.pixelHeight;
    uniforms[2] = reduceMotion ? 0 : (now - startTime) / 1000;
    uniforms[3] = camera.distance;
    uniforms[4] = camera.yaw;
    uniforms[5] = camera.pitch;
    uniforms[6] = markers.length;
    device.queue.writeBuffer(uniformBuffer, 0, uniforms);

    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          loadOp: 'clear',
          clearValue: { r: 0.005, g: 0.012, b: 0.035, a: 1 },
          storeOp: 'store',
        },
      ],
    });

    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(3);
    pass.end();
    device.queue.submit([encoder.finish()]);
    setPlacements(projectMarkers(markers, camera, size.cssWidth, size.cssHeight));
    frameId = window.requestAnimationFrame(render);
  };

  return {
    mode: 'webgpu',
    start: () => {
      frameId = window.requestAnimationFrame(render);
    },
    destroy: () => {
      window.cancelAnimationFrame(frameId);
    },
  };
}

function projectMarkers(
  markers: readonly MarkerRenderData[],
  camera: CameraState,
  width: number,
  height: number,
): readonly MarkerPlacement[] {
  if (width <= 0 || height <= 0 || markers.length === 0) {
    return [];
  }

  const cameraDirection = cameraDirectionFromAngles(camera.yaw, camera.pitch);
  const cameraPosition = multiplyVector(cameraDirection, camera.distance);
  const forward = normalizeVector(multiplyVector(cameraPosition, -1));
  const right = getCameraRight(forward);
  const up = normalizeVector(cross(forward, right));
  const tanHalfFov = Math.tan(FOV_RADIANS / 2);
  const aspect = width / height;
  const projected = markers
    .map((marker) => {
      const horizon = 1 / camera.distance;

      if (dot(marker.position, cameraDirection) < horizon - 0.035) {
        return null;
      }

      const toPoint = subtractVectors(marker.position, cameraPosition);
      const z = dot(toPoint, forward);

      if (z <= 0) {
        return null;
      }

      const ndcX = dot(toPoint, right) / (z * tanHalfFov * aspect);
      const ndcY = dot(toPoint, up) / (z * tanHalfFov);

      if (Math.abs(ndcX) > 1.18 || Math.abs(ndcY) > 1.18) {
        return null;
      }

      return {
        marker,
        x: ((ndcX + 1) / 2) * width,
        y: ((1 - ndcY) / 2) * height,
      };
    })
    .filter((placement): placement is { marker: MarkerRenderData; x: number; y: number } => placement !== null);

  return projected.map((placement, index) => {
    const nearest = projected.reduce((currentNearest, other) => {
      if (other.marker.id === placement.marker.id) {
        return currentNearest;
      }

      return Math.min(currentNearest, Math.hypot(other.x - placement.x, other.y - placement.y));
    }, Math.min(width, height) * 0.28);
    const presentation = getMarkerPresentation(Math.max(nearest, getZoomScreenSpace(camera.distance, projected.length)));
    const shouldDeclutter = nearest < 34 && presentation.mode !== 'dot';
    const spreadAngle = index * 2.399963229728653;
    const spreadRadius = shouldDeclutter ? (presentation.mode === 'price' ? 34 + Math.min(projected.length, 14) * 3.2 : 15) : 0;
    const x = placement.x + Math.cos(spreadAngle) * spreadRadius;
    const y = placement.y + Math.sin(spreadAngle) * spreadRadius * 0.64;

    return {
      ...placement.marker,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      mode: presentation.mode,
      scale: presentation.scale,
    };
  });
}

function getZoomScreenSpace(distance: number, visibleMarkerCount: number): number {
  const zoomProgress = clamp((MAX_CAMERA_DISTANCE - distance) / (MAX_CAMERA_DISTANCE - MIN_CAMERA_DISTANCE), 0, 1);
  const densityPenalty = Math.sqrt(Math.max(visibleMarkerCount, 1) / 6);

  return (24 + Math.pow(zoomProgress, 2.2) * 170) / densityPenalty;
}

function cameraDirectionFromAngles(yaw: number, pitch: number): UnitVector3 {
  const cp = Math.cos(pitch);

  return {
    x: Math.sin(yaw) * cp,
    y: Math.sin(pitch),
    z: Math.cos(yaw) * cp,
  };
}

function getCameraRight(forward: UnitVector3): UnitVector3 {
  const candidate = cross({ x: 0, y: 1, z: 0 }, forward);

  if (vectorLength(candidate) < 0.001) {
    return { x: 1, y: 0, z: 0 };
  }

  return normalizeVector(candidate);
}

function resizeCanvas(canvas: HTMLCanvasElement) {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const cssWidth = Math.max(1, canvas.clientWidth);
  const cssHeight = Math.max(1, canvas.clientHeight);
  const pixelWidth = Math.max(1, Math.floor(cssWidth * pixelRatio));
  const pixelHeight = Math.max(1, Math.floor(cssHeight * pixelRatio));

  if (canvas.width !== pixelWidth) {
    canvas.width = pixelWidth;
  }

  if (canvas.height !== pixelHeight) {
    canvas.height = pixelHeight;
  }

  return { cssWidth, cssHeight, pixelWidth, pixelHeight };
}

function normalizeVector(vector: UnitVector3): UnitVector3 {
  const length = vectorLength(vector);

  if (length === 0) {
    return { x: 0, y: 0, z: 1 };
  }

  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length,
  };
}

function multiplyVector(vector: UnitVector3, scalar: number): UnitVector3 {
  return {
    x: vector.x * scalar,
    y: vector.y * scalar,
    z: vector.z * scalar,
  };
}

function subtractVectors(left: UnitVector3, right: UnitVector3): UnitVector3 {
  return {
    x: left.x - right.x,
    y: left.y - right.y,
    z: left.z - right.z,
  };
}

function cross(left: UnitVector3, right: UnitVector3): UnitVector3 {
  return {
    x: left.y * right.z - left.z * right.y,
    y: left.z * right.x - left.x * right.z,
    z: left.x * right.y - left.y * right.x,
  };
}

function dot(left: UnitVector3, right: UnitVector3): number {
  return left.x * right.x + left.y * right.y + left.z * right.z;
}

function vectorLength(vector: UnitVector3): number {
  return Math.hypot(vector.x, vector.y, vector.z);
}

function lerp(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

function lerpAngle(from: number, to: number, progress: number): number {
  const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from));
  return from + delta * progress;
}

function easeOutCubic(value: number): number {
  return 1 - Math.pow(1 - value, 3);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
