import { describe, expect, it } from 'vitest';

import { getCompactLengthLabel, getCompactVariantLabel } from './controls';

describe('bottom toolbar controls', () => {
  it('shortens compact stay length labels to numbers', () => {
    expect(getCompactLengthLabel('8')).toBe('8');
    expect(getCompactLengthLabel('14')).toBe('14');
  });

  it('keeps compact variant labels short enough for the mobile toolbar', () => {
    const variant = 'B — rozsądnie: lokalizacja / opinia / pralka preferowana';

    expect(getCompactVariantLabel(variant, false)).toBe('B');
    expect(getCompactVariantLabel(variant, true)).toBe('B - rozsądnie');
  });
});
