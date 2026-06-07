import { CANVAS_VIEWS, ViewId } from './model';

export type BackgroundRendererMode = 'webgpu' | 'webgl' | 'static';

export type BackgroundRendererCapabilities = {
  webgpu: boolean;
  webgl: boolean;
};

export type AtmosphereState = {
  progress: number;
  scrollDepth: number;
  sunX: number;
  sunY: number;
  sunRadius: number;
  sunGlow: number;
  skyExposure: number;
};

export function getAtmosphereState(view: ViewId, scrollDepth = 0): AtmosphereState {
  const tabIndex = CANVAS_VIEWS.findIndex((tab) => tab.id === view);

  if (tabIndex < 0) {
    throw new Error(`Unknown view: ${view}`);
  }

  const lastIndex = Math.max(CANVAS_VIEWS.length - 1, 1);
  const progress = Number((tabIndex / lastIndex).toFixed(4));
  const normalizedScrollDepth = clamp(scrollDepth, 0, 1);
  const sunArc = Math.sin(progress * Math.PI);
  const arcStrength = 0.07 - normalizedScrollDepth * 0.03;

  return {
    progress,
    scrollDepth: normalizedScrollDepth,
    sunX: 0.14 + progress * 0.72,
    sunY: 0.34 + normalizedScrollDepth * 0.23 - sunArc * arcStrength,
    sunRadius: 0.165 - normalizedScrollDepth * 0.123,
    sunGlow: 0.98 - normalizedScrollDepth * 0.64,
    skyExposure: 1.18 - normalizedScrollDepth * 0.48
  };
}

export function normalizeScrollDepth(scrollY: number, viewportHeight: number, documentHeight: number): number {
  const scrollRange = documentHeight - viewportHeight;

  if (!Number.isFinite(scrollRange) || scrollRange <= 0) {
    return 0;
  }

  return clamp(scrollY / scrollRange, 0, 1);
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
}

export function choosePreferredBackgroundRenderer(
  capabilities: BackgroundRendererCapabilities,
): BackgroundRendererMode {
  if (capabilities.webgpu) {
    return 'webgpu';
  }

  if (capabilities.webgl) {
    return 'webgl';
  }

  return 'static';
}
