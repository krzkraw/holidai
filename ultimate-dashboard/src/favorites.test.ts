import { describe, expect, it } from 'vitest';

import { BookingJson } from './data/bookings';
import { FLIGHT_OPTIONS } from './data/flights';
import {
  getFavoriteBookingsForDestination,
  getFavoriteFlightsForDestination,
  getFlightFavoriteKey,
  resolveSelectedFavoriteAfterToggle,
  toggleFavoriteBooking,
  toggleFavoriteFlight,
} from './favorites';

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

  it('toggles favorite flights independently from hotel favorites', () => {
    const firstFlight = FLIGHT_OPTIONS.find((flight) => flight.destination === 'Albania' && flight.bucket === 'main');
    const secondFlight = FLIGHT_OPTIONS.find((flight) => flight.destination === 'Cypr' && flight.bucket === 'extra');

    if (!firstFlight || !secondFlight) {
      throw new Error('Missing flight fixture');
    }

    const addedFirst = toggleFavoriteFlight({}, 'Albania', firstFlight);
    const addedSecond = toggleFavoriteFlight(addedFirst, 'Cypr', secondFlight);
    const removedFirst = toggleFavoriteFlight(addedSecond, 'Albania', firstFlight);

    expect(addedSecond.Albania).toEqual([getFlightFavoriteKey(firstFlight)]);
    expect(addedSecond.Cypr).toEqual([getFlightFavoriteKey(secondFlight)]);
    expect(removedFirst.Albania).toEqual([]);
    expect(removedFirst.Cypr).toEqual([getFlightFavoriteKey(secondFlight)]);
  });

  it('returns favorite flights for one destination in stored order', () => {
    const flights = FLIGHT_OPTIONS.filter((flight) => flight.destination === 'Cypr' && flight.bucket === 'extra').slice(0, 3);
    const favorites = { Cypr: [getFlightFavoriteKey(flights[2]), getFlightFavoriteKey(flights[0])] };

    expect(getFavoriteFlightsForDestination(FLIGHT_OPTIONS, 'Cypr', favorites)).toEqual([flights[2], flights[0]]);
  });

  it('selects the first added favorite without overriding an existing favorite selection', () => {
    expect(resolveSelectedFavoriteAfterToggle([], undefined, 'first')).toBe('first');
    expect(resolveSelectedFavoriteAfterToggle(['first'], 'first', 'second')).toBe('first');
    expect(resolveSelectedFavoriteAfterToggle(['first'], undefined, 'second')).toBeUndefined();
  });

  it('clears selection only when the removed favorite was selected', () => {
    expect(resolveSelectedFavoriteAfterToggle(['first'], 'first', 'first')).toBeUndefined();
    expect(resolveSelectedFavoriteAfterToggle(['first', 'second'], 'second', 'first')).toBe('second');
  });
});
