import { describe, expect, it } from 'vitest';

import { BookingJson } from './data/bookings';
import { FLIGHT_OPTIONS } from './data/flights';
import { calculateTripTotal, calculateTripTotalRange, formatTripTotal, formatTripTotalRange } from './selection';

function booking(price: number | null): BookingJson {
  return {
    destination: 'Albania',
    tier: 'A',
    name: 'Selected hotel',
    rating: null,
    reviews: 0,
    laundry: '',
    washingMachineConfirmed: false,
    washingMachineOnlyInReviews: false,
    laundryService: false,
    kitchen: false,
    privateBathroom: true,
    beachView: false,
    seaView: false,
    parking: false,
    beachInfo: '',
    evaluation: 8,
    pageContent: '',
    details: {
      title: 'Selected hotel',
      country: 'Albania',
      propertyName: 'Selected hotel',
      address: '',
      coordinates: null,
      imageUrls: [],
      description: '',
      stayPrices: [],
      roomTable: { columns: [], rows: [], raw: '' },
      review: { score: null, count: 0 },
      comments: [],
      surroundingsRaw: '',
      amenities: {
        flatList: [],
        laundry: { confirmed: false, onlyInReviews: false, service: false, evidence: [] },
      },
      policy: { houseRulesRaw: '', importantInfoRaw: '' },
      authorSummaryBullets: [],
      captureQuality: 'complete',
      issues: [],
      placeholders: [],
      enrichments: {},
    },
    url: 'https://example.com/hotel',
    stays: [{ days: 11, checkIn: '2026-09-16', checkOut: '2026-09-27', price }],
  };
}

describe('trip selection totals', () => {
  it('adds the selected stay price and selected flight price', () => {
    const flight = FLIGHT_OPTIONS.find(
      (option) => option.destination === 'Albania' && option.dates === '2026-09-16 → 2026-09-27' && option.price === '703 zł',
    );

    if (!flight) {
      throw new Error('Missing flight fixture');
    }

    const total = calculateTripTotal(booking(1300), '11', flight);

    expect(total).toEqual({ hotel: 1300, flight: 703, total: 2003 });
    expect(total).not.toBeNull();
    if (total) {
      expect(formatTripTotal(total)).toBe('2 003 PLN');
    }
  });

  it('does not invent a total when either selected price is missing', () => {
    const unavailableFlight = { ...FLIGHT_OPTIONS[0], price: '-' };

    expect(calculateTripTotal(booking(null), '11', FLIGHT_OPTIONS[0])).toBeNull();
    expect(calculateTripTotal(booking(1300), '11', unavailableFlight)).toBeNull();
  });

  it('finds the cheapest and most expensive total among favorite hotels and flights', () => {
    const firstFlight = FLIGHT_OPTIONS.find(
      (option) => option.destination === 'Albania' && option.dates === '2026-09-16 → 2026-09-27' && option.price === '703 zł',
    );
    const secondFlight = FLIGHT_OPTIONS.find(
      (option) => option.destination === 'Albania' && option.dates === '2026-09-16 → 2026-09-27' && option.price === '1134 zł',
    );

    if (!firstFlight || !secondFlight) {
      throw new Error('Missing flight fixtures');
    }

    const range = calculateTripTotalRange(
      [booking(1300), { ...booking(2100), url: 'https://example.com/second-hotel' }, booking(null)],
      '11',
      [firstFlight, secondFlight, { ...firstFlight, price: '-' }],
    );

    expect(range).toEqual({ min: 2003, max: 3234 });
    expect(formatTripTotalRange(range)).toBe('2 003-3 234 PLN');
  });

  it('does not invent a range when no favorite combination has both prices', () => {
    expect(calculateTripTotalRange([booking(null)], '11', [{ ...FLIGHT_OPTIONS[0], price: '-' }])).toBeNull();
    expect(formatTripTotalRange(null)).toBeNull();
  });
});
