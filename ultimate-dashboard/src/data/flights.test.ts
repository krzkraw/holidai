import { describe, expect, it } from 'vitest';

import {
  FLIGHT_OPTIONS,
  formatFlightInfo,
  parseFlightPrice,
  getFlightOptionsForDestination,
  getFlightStayDays,
} from './flights';

describe('flight options data', () => {
  it('pairs in-term flights with the hotel stay selector dates', () => {
    const greekFlights = getFlightOptionsForDestination(FLIGHT_OPTIONS, 'Grecja', 'main');

    expect([...new Set(greekFlights.map((flight) => flight.dates))]).toEqual([
      '2026-09-12 → 2026-09-20',
      '2026-09-12 → 2026-09-23',
      '2026-09-12 → 2026-09-26',
    ]);
    expect(greekFlights.map((flight) => getFlightStayDays('Grecja', flight)).filter(Boolean)).toEqual([
      '8',
      '8',
      '11',
      '11',
      '14',
      '14',
    ]);
  });

  it('keeps additional flights in a separate bucket with non-hotel dates', () => {
    const extraAlbaniaFlights = getFlightOptionsForDestination(FLIGHT_OPTIONS, 'Albania', 'extra');

    expect(extraAlbaniaFlights).toHaveLength(18);
    expect(extraAlbaniaFlights.some((flight) => flight.dates === '2026-09-16 → 2026-09-24')).toBe(false);
    expect(getFlightOptionsForDestination(FLIGHT_OPTIONS, 'Turcja', 'extra')).toEqual([]);
  });

  it('formats source inside the info column instead of exposing a separate source column', () => {
    const directFlight = getFlightOptionsForDestination(FLIGHT_OPTIONS, 'Albania', 'main')[0];

    expect(formatFlightInfo(directFlight)).toBe('DIRECT · skyscanner');
  });

  it('parses flight prices for trip totals and keeps unavailable flights unpriced', () => {
    expect(parseFlightPrice({ price: '1196 zł' })).toBe(1196);
    expect(parseFlightPrice({ price: '1 196 zł' })).toBe(1196);
    expect(parseFlightPrice({ price: '-' })).toBeNull();
  });
});
