import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

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
    expect(html).toContain('1388 zł');
    expect(html).toContain('przesiadka 2x · skyscanner');
    expect(html.match(/flight-options-row--active/g)).toHaveLength(2);
  });
});
