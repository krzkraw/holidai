import { describe, expect, it } from 'vitest';

import { getCompactLengthLabel, getCompactVariantLabel } from './controls';

describe('bottom toolbar controls', () => {
  it('shortens compact stay length labels to numbers', () => {
    expect(getCompactLengthLabel('8')).toBe('8');
    expect(getCompactLengthLabel('14')).toBe('14');
  });

  it('shows only the category letter except for the selected variant', () => {
    const variant = 'B — rozsądnie: lokalizacja / opinia / pralka preferowana';

    expect(getCompactVariantLabel(variant, false)).toBe('B');
    expect(getCompactVariantLabel(variant, true)).toBe(variant);
  });
});
