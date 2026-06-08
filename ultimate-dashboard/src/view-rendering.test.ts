import { describe, expect, it } from 'vitest';

import type { ViewId } from './model';

type ShouldRenderViewContent = (
  activeView: ViewId,
  previousView: ViewId | null,
  viewId: ViewId,
) => boolean;

type ResolveLightweightVisualsPreference = (preference: boolean | null | undefined) => boolean;

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
});
