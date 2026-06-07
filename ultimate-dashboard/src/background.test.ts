import { describe, expect, it } from 'vitest';
import { DESTINATION_TABS } from './model';
import { choosePreferredBackgroundRenderer, getAtmosphereState } from './background';

describe('dynamic atmosphere background', () => {
  it('moves the sun from left to right across the dashboard tabs', () => {
    const states = DESTINATION_TABS.map((tab) => getAtmosphereState(tab.id));

    expect(states.map((state) => state.progress)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);

    for (let index = 1; index < states.length; index += 1) {
      expect(states[index].sunX).toBeGreaterThan(states[index - 1].sunX);
    }

    expect(states[0].sunX).toBeCloseTo(0.14);
    expect(states.at(-1)?.sunX).toBeCloseTo(0.86);
  });

  it('prefers WebGPU, then trivial WebGL, then the existing static CSS background', () => {
    expect(choosePreferredBackgroundRenderer({ webgpu: true, webgl: true })).toBe('webgpu');
    expect(choosePreferredBackgroundRenderer({ webgpu: false, webgl: true })).toBe('webgl');
    expect(choosePreferredBackgroundRenderer({ webgpu: false, webgl: false })).toBe('static');
  });
});
