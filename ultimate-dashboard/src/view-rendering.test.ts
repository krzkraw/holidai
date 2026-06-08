import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ViewId } from './model';

type ShouldRenderViewContent = (
  activeView: ViewId,
  previousView: ViewId | null,
  viewId: ViewId,
) => boolean;

type ResolveLightweightVisualsPreference = (preference: boolean | null | undefined) => boolean;

type PostPaintSchedulerSurface = {
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame: (handle: number) => void;
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
  setTimeout: (callback: () => void, delay: number) => number;
  clearTimeout: (handle: number) => void;
};

type SchedulePostPaintIdleTask = (
  callback: () => void,
  scheduler?: PostPaintSchedulerSurface,
) => { cancel: () => void };

afterEach(() => {
  vi.restoreAllMocks();
});

describe('view rendering performance policy', () => {
  it('renders heavy view content only for the active and previous canvas views', async () => {
    const module = await import('./App');
    const shouldRenderViewContent = (module as { shouldRenderViewContent?: ShouldRenderViewContent })
      .shouldRenderViewContent;

    expect(shouldRenderViewContent).toBeTypeOf('function');
    expect(shouldRenderViewContent?.('cypr', 'grecja', 'cypr')).toBe(true);
    expect(shouldRenderViewContent?.('cypr', 'grecja', 'grecja')).toBe(true);
    expect(shouldRenderViewContent?.('cypr', 'grecja', 'albania')).toBe(false);
  });

  it('defaults the FX mode to lightweight visuals', async () => {
    const module = await import('./App');
    const resolveLightweightVisualsPreference = (
      module as { resolveLightweightVisualsPreference?: ResolveLightweightVisualsPreference }
    ).resolveLightweightVisualsPreference;

    expect(resolveLightweightVisualsPreference).toBeTypeOf('function');
    expect(resolveLightweightVisualsPreference?.(null)).toBe(true);
    expect(resolveLightweightVisualsPreference?.(undefined)).toBe(true);
    expect(resolveLightweightVisualsPreference?.(false)).toBe(false);
  });

  it('schedules booking preload after two animation frames and idle time', async () => {
    const module = await import('./App');
    const schedulePostPaintIdleTask = (
      module as { schedulePostPaintIdleTask?: SchedulePostPaintIdleTask }
    ).schedulePostPaintIdleTask;
    const frames: FrameRequestCallback[] = [];
    const idleCallbacks: IdleRequestCallback[] = [];
    const callback = vi.fn();
    const scheduler: PostPaintSchedulerSurface = {
      requestAnimationFrame: (frameCallback) => {
        frames.push(frameCallback);
        return frames.length;
      },
      cancelAnimationFrame: vi.fn(),
      requestIdleCallback: (idleCallback) => {
        idleCallbacks.push(idleCallback);
        return idleCallbacks.length;
      },
      cancelIdleCallback: vi.fn(),
      setTimeout: vi.fn(() => 1),
      clearTimeout: vi.fn(),
    };

    expect(schedulePostPaintIdleTask).toBeTypeOf('function');

    schedulePostPaintIdleTask?.(callback, scheduler);

    expect(callback).not.toHaveBeenCalled();
    expect(frames).toHaveLength(1);

    frames[0](0);
    expect(callback).not.toHaveBeenCalled();
    expect(frames).toHaveLength(2);

    frames[1](16);
    expect(callback).not.toHaveBeenCalled();
    expect(idleCallbacks).toHaveLength(1);

    idleCallbacks[0]({ didTimeout: false, timeRemaining: () => 12 });
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
