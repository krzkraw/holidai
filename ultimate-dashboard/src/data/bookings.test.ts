import { describe, expect, it } from 'vitest';

import bookingsFixture from '../../data/bookings/bookings.json';
import {
  BookingJson,
  formatStayPrice,
  getBookingsForDestination,
  getStayForDays,
  parseBookingsResponse,
  renderRoomCellLines,
  validateBookingsData,
} from './bookings';
import { HOTEL_MATRIX_GROUPS } from '../model';

async function gzipJson(value: unknown): Promise<ArrayBuffer> {
  const stream = new Blob([JSON.stringify(value)]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Response(stream).arrayBuffer();
}

function minimalBooking(overrides: Record<string, unknown> = {}): BookingJson {
  return {
    destination: 'Albania',
    tier: 'A — super: plaża / ocena / okolica',
    name: 'Example Apartments',
    rating: 9.1,
    reviews: 123,
    laundry: 'Pralka potwierdzona',
    washingMachineConfirmed: true,
    washingMachineOnlyInReviews: false,
    laundryService: false,
    kitchen: true,
    privateBathroom: true,
    beachView: false,
    seaView: true,
    parking: true,
    beachInfo: 'The nearest beach is 150 ft away.',
    evaluation: 8.7,
    pageContent: 'scrape/example.md',
    url: 'https://www.booking.com/hotel/example.html',
    stays: [
      { days: 8, checkIn: '2026-09-16', checkOut: '2026-09-24', price: 1800 },
      { days: 11, checkIn: '2026-09-16', checkOut: '2026-09-27', price: 2400 },
      { days: 14, checkIn: '2026-09-16', checkOut: '2026-09-30', price: 3000 },
    ],
    details: {
      title: 'Albania - Example Apartments',
      country: 'Albania',
      propertyName: 'Example Apartments',
      address: '',
      coordinates: null,
      imageUrls: [],
      description: 'Example property description.',
      stayPrices: [{ nights: 14, dateRange: '16.09 - 30.09', pricePln: 999999, raw: '999999 PLN' }],
      roomTable: { columns: ['Room'], rows: [['Apartment <br> Sea view']], raw: '' },
      review: { score: 9.1, count: 123 },
      comments: [{ author: 'Anna', text: 'Clean and close to the beach.' }],
      surroundingsRaw: '',
      amenities: {
        flatList: ['Parking'],
        laundry: {
          confirmed: true,
          onlyInReviews: false,
          service: false,
          evidence: ['Washer listed in amenities'],
        },
      },
      policy: { houseRulesRaw: '', importantInfoRaw: '' },
      authorSummaryBullets: ['Strong location'],
      captureQuality: 'complete',
      issues: [],
      placeholders: [],
      enrichments: { 'Overall Impression': 'Strong fit.' },
    },
    ...overrides,
  } as BookingJson;
}

describe('bookings data loader', () => {
  it('decompresses gzip booking JSON responses', async () => {
    const bookings = [minimalBooking()];
    const response = new Response(await gzipJson(bookings));

    await expect(parseBookingsResponse(response, 'gzip')).resolves.toEqual(bookings);
  });

  it('falls back to plain JSON responses', async () => {
    const bookings = [minimalBooking({ destination: 'Cypr' })];
    const response = new Response(JSON.stringify(bookings));

    await expect(parseBookingsResponse(response, 'json')).resolves.toEqual(bookings);
  });

  it('does not double-decompress responses already decoded by the browser', async () => {
    const bookings = [minimalBooking({ destination: 'Kreta' })];
    const response = new Response(JSON.stringify(bookings), {
      headers: { 'content-encoding': 'gzip' },
    });

    await expect(parseBookingsResponse(response, 'gzip')).resolves.toEqual(bookings);
  });

  it('rejects booking data without stays, details, or required booking fields', async () => {
    const cases = [
      [minimalBooking({ stays: undefined }), 'stays'],
      [minimalBooking({ details: undefined }), 'details'],
      [minimalBooking({ name: undefined }), 'name'],
    ] as const;

    for (const [booking, missingField] of cases) {
      const response = new Response(JSON.stringify([booking]));

      await expect(parseBookingsResponse(response, 'json')).rejects.toThrow(missingField);
    }
  });

  it('selects the 10 current-variant bookings for every destination and tier', () => {
    const bookings = validateBookingsData(bookingsFixture);

    for (const group of HOTEL_MATRIX_GROUPS) {
      for (const tier of group.variants) {
        const selected = getBookingsForDestination(bookings, group.destination, tier, 14);

        expect(selected).toHaveLength(10);
        expect(selected.every((booking) => booking.destination === group.destination)).toBe(true);
        expect(selected.every((booking) => booking.tier === tier)).toBe(true);
        expect(selected.map((booking) => booking.evaluation)).toEqual(
          [...selected.map((booking) => booking.evaluation)].sort((a, b) => b - a),
        );
      }
    }
  });

  it('uses selected stays for 8, 11, and 14 day prices instead of details.stayPrices', () => {
    const booking = minimalBooking({
      stays: [
        { days: 8, checkIn: '2026-09-16', checkOut: '2026-09-24', price: 1111 },
        { days: 11, checkIn: '2026-09-16', checkOut: '2026-09-27', price: 2222 },
        { days: 14, checkIn: '2026-09-16', checkOut: '2026-09-30', price: 3333 },
      ],
    });

    expect(formatStayPrice(getStayForDays(booking, '8'))).toBe('1 111 PLN');
    expect(formatStayPrice(getStayForDays(booking, '11'))).toBe('2 222 PLN');
    expect(formatStayPrice(getStayForDays(booking, '14'))).toBe('3 333 PLN');
  });

  it('turns room table br markup into text lines without raw HTML rendering', () => {
    expect(renderRoomCellLines('Apartament <br> Prywatna kuchnia <br/> <strong>Widok na morze</strong>')).toEqual([
      'Apartament',
      'Prywatna kuchnia',
      'Widok na morze',
    ]);
  });
});
