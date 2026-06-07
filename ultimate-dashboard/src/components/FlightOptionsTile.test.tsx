import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { FLIGHT_OPTIONS } from '../data/flights';
import { getFlightFavoriteKey } from '../favorites';
import { FlightOptionsTile } from './FlightOptionsTile';

describe('FlightOptionsTile', () => {
  it('renders in-term flights with selected-stay rows highlighted', () => {
    const html = renderToStaticMarkup(<FlightOptionsTile destination="Grecja" selectedLength="11" />);

    expect(html).toContain('Loty w terminach');
    expect(html).toContain('Dodatkowe loty');
    expect(html).toContain('PATH');
    expect(html).toContain('DATES');
    expect(html).toContain('PRICE');
    expect(html).toContain('INFO');
    expect(html).toContain('KRK ⇄ ZTH');
    expect(html).toContain('2300 zł');
    expect(html).toContain('przesiadka 1x · esky');
    expect(html.match(/flight-options-row--active/g)).toHaveLength(2);
  });

  it('renders favorite toggles in a leading row action column', () => {
    const favoriteFlight = FLIGHT_OPTIONS.find((flight) => flight.destination === 'Grecja' && flight.bucket === 'main');

    if (!favoriteFlight) {
      throw new Error('Missing flight fixture');
    }

    const html = renderToStaticMarkup(
      <FlightOptionsTile
        destination="Grecja"
        favoriteFlightIds={[getFlightFavoriteKey(favoriteFlight)]}
        selectedLength="11"
        onFavoriteToggle={() => undefined}
      />,
    );

    expect(html).toContain('flight-favorite-toggle--active');
    expect(html).toContain('aria-label="Usuń lot KRK ⇄ ZTH 2026-09-12 → 2026-09-20 z ulubionych"');
    expect(html).toContain('<th class="flight-options-action-heading" aria-label="Ulubione loty"></th><th>PATH</th><th>DATES</th><th>PRICE</th><th>INFO</th>');
    expect(html.indexOf('flight-options-action-cell')).toBeLessThan(html.indexOf('KRK ⇄ ZTH'));
  });
});
