import { describe, expect, it } from 'vitest';

import { BookingJson } from './data/bookings';
import { getFavoriteBookingsForDestination, toggleFavoriteBooking } from './favorites';

function booking(destination: BookingJson['destination'], name: string, url = `https://example.com/${name}`): BookingJson {
  return {
    destination,
    tier: 'A',
    name,
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
      title: name,
      country: destination,
      propertyName: name,
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
    url,
    stays: [
      { days: 8, checkIn: '2026-09-16', checkOut: '2026-09-24', price: 1000 },
      { days: 11, checkIn: '2026-09-16', checkOut: '2026-09-27', price: 1300 },
      { days: 14, checkIn: '2026-09-16', checkOut: '2026-09-30', price: 1600 },
    ],
  };
}

describe('booking favorites helpers', () => {
  it('toggles favorite keys only inside the selected destination bucket', () => {
    const first = booking('Albania', 'First');
    const second = booking('Cypr', 'Second');
    const addedFirst = toggleFavoriteBooking({}, 'Albania', first);
    const addedSecond = toggleFavoriteBooking(addedFirst, 'Cypr', second);
    const removedFirst = toggleFavoriteBooking(addedSecond, 'Albania', first);

    expect(addedSecond.Albania).toEqual([first.url]);
    expect(addedSecond.Cypr).toEqual([second.url]);
    expect(removedFirst.Albania).toEqual([]);
    expect(removedFirst.Cypr).toEqual([second.url]);
  });

  it('returns favorite bookings for one destination in stored order', () => {
    const first = booking('Albania', 'First');
    const second = booking('Albania', 'Second');
    const otherDestination = booking('Cypr', 'Other');
    const favorites = { Albania: [second.url, first.url], Cypr: [otherDestination.url] };

    expect(getFavoriteBookingsForDestination([first, second, otherDestination], 'Albania', favorites)).toEqual([
      second,
      first,
    ]);
  });
});
