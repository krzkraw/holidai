import { describe, expect, it } from 'vitest';

import type { ViewId } from './model';

type ShouldRenderViewContent = (
  activeView: ViewId,
  previousView: ViewId | null,
  viewId: ViewId,
) => boolean;

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
});
