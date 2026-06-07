import { DESTINATION_TABS, ViewId } from './model';

export type BackgroundRendererMode = 'webgpu' | 'webgl' | 'static';

export type BackgroundRendererCapabilities = {
  webgpu: boolean;
  webgl: boolean;
};

export type AtmosphereState = {
  progress: number;
  sunX: number;
  sunY: number;
};

export function getAtmosphereState(view: ViewId): AtmosphereState {
  const tabIndex = DESTINATION_TABS.findIndex((tab) => tab.id === view);

  if (tabIndex < 0) {
    throw new Error(`Unknown view: ${view}`);
  }

  const lastIndex = Math.max(DESTINATION_TABS.length - 1, 1);
  const progress = Number((tabIndex / lastIndex).toFixed(4));
  const sunArc = Math.sin(progress * Math.PI);

  return {
    progress,
    sunX: 0.14 + progress * 0.72,
    sunY: 0.39 - sunArc * 0.07
  };
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
