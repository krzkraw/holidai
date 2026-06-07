import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { BookingGrid } from './BookingGrid';

describe('BookingGrid', () => {
  it('renders a globe action above the hotel cards when map navigation is available', () => {
    const html = renderToStaticMarkup(
      <BookingGrid
        bookings={[]}
        destination="Cypr"
        selectedLength="11"
        selectedVariant="A - sample"
        onOpenGlobe={() => undefined}
      />,
    );

    expect(html).toContain('booking-globe-button');
    expect(html).toContain('Otwórz mapę 3D hoteli');
    expect(html.indexOf('booking-globe-button')).toBeLessThan(html.indexOf('booking-empty'));
  });
});
