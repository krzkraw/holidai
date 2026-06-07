import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildBookingsFromCsvText, serializeBookings } from './generate-bookings-data';

const repoRoot = resolve(import.meta.dirname, '..', '..');

describe('generate bookings data', () => {
  it('groups CSV rows into booking records and keeps stay rows nested', () => {
    const csvText = readFileSync(resolve(repoRoot, 'destinations-final.csv'), 'utf8');
    const bookings = buildBookingsFromCsvText(csvText);

    expect(bookings).toHaveLength(170);

    const whiteDonkey = bookings.find(
      (booking) =>
        booking.destination === 'Albania' &&
        booking.name === 'The White Donkey Apartment House' &&
        booking.tier === 'A — super: plaża / ocena / okolica',
    );

    expect(whiteDonkey?.stays.map((stay) => stay.days)).toEqual([8, 11, 14]);
    expect(whiteDonkey?.stays.map((stay) => stay.checkOut)).toEqual(['2026-09-24', '2026-09-27', '2026-09-30']);
    expect(whiteDonkey?.url).toBe(
      'https://www.booking.com/hotel/al/the-white-donkey.html?aid=2438770&no_rooms=1&group_adults=2&selected_currency=PLN',
    );
    expect(whiteDonkey?.details.enrichments['Overall Impression']).not.toBe('');
  });

  it('serializes bookings as formatted JSON array', () => {
    const jsonText = serializeBookings([
      {
        destination: 'Albania',
        tier: 'A',
        name: 'Example',
        stays: [],
      },
    ]);

    expect(jsonText).toBe('[\n  {\n    "destination": "Albania",\n    "tier": "A",\n    "name": "Example",\n    "stays": []\n  }\n]\n');
  });
});
