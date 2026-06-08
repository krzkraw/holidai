import { describe, expect, it } from 'vitest';

import { createCanvasSizeTracker } from './ShaderBackground';

describe('shader background canvas sizing', () => {
  it('caches canvas pixel size until an explicit refresh', () => {
    let clientWidthReads = 0;
    let clientHeightReads = 0;
    let viewportWidth = 640;
    let viewportHeight = 360;
    const canvas = {
      width: 0,
      height: 0,
      get clientWidth() {
        clientWidthReads += 1;
        return viewportWidth;
      },
      get clientHeight() {
        clientHeightReads += 1;
        return viewportHeight;
      },
    } as HTMLCanvasElement;
    const tracker = createCanvasSizeTracker(canvas, () => 2);

    expect(tracker.refresh()).toEqual({ width: 1280, height: 720 });
    expect(tracker.getSize()).toEqual({ width: 1280, height: 720 });
    expect(tracker.getSize()).toEqual({ width: 1280, height: 720 });
    expect(clientWidthReads).toBe(1);
    expect(clientHeightReads).toBe(1);

    viewportWidth = 800;
    viewportHeight = 450;

    expect(tracker.getSize()).toEqual({ width: 1280, height: 720 });
    expect(tracker.refresh()).toEqual({ width: 1600, height: 900 });
    expect(canvas.width).toBe(1600);
    expect(canvas.height).toBe(900);
    expect(clientWidthReads).toBe(2);
    expect(clientHeightReads).toBe(2);
  });
});
