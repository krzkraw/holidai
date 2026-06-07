import { expect, test } from 'bun:test';

import { BookingMatrix, bookingsFromMatrix } from '../src';

test('bookingsFromMatrix groups the final matrix into DDD bookings with stays', async () => {
  const csvText = await Bun.file('destinations-final.csv').text();
  const matrix = BookingMatrix.fromCsvText(csvText);
  const bookings = bookingsFromMatrix(matrix);

  expect(bookings).toHaveLength(170);

  const whiteDonkey = bookings.find(
    (booking) =>
      booking.destination === 'Albania' &&
      booking.name === 'The White Donkey Apartment House' &&
      booking.tier === 'A — super: plaża / ocena / okolica',
  );

  expect(whiteDonkey).toBeDefined();
  expect(whiteDonkey?.stays).toHaveLength(3);
  expect(whiteDonkey?.stays.map((stay) => stay.days)).toEqual([8, 11, 14]);
  expect(whiteDonkey?.stays.map((stay) => stay.checkIn)).toEqual(['2026-09-16', '2026-09-16', '2026-09-16']);
  expect(whiteDonkey?.stays.map((stay) => stay.checkOut)).toEqual(['2026-09-24', '2026-09-27', '2026-09-30']);
  expect(whiteDonkey?.url).toBe(
    'https://www.booking.com/hotel/al/the-white-donkey.html?aid=2438770&no_rooms=1&group_adults=2&selected_currency=PLN',
  );

  const idealApartHotelSaranda = bookings.find(
    (booking) =>
      booking.destination === 'Albania' &&
      booking.name === 'Ideal ApartHotel Saranda' &&
      booking.tier === 'C — po kosztach: prywatna łazienka i rozsądne warunki',
  );

  expect(idealApartHotelSaranda).toBeDefined();
  expect(idealApartHotelSaranda?.stays.map((stay) => stay.price)).toEqual([null, null, null]);
});

test('bookingsFromMatrix attaches the serialized page details for each booking', async () => {
  const csvText = await Bun.file('destinations-final.csv').text();
  const matrix = BookingMatrix.fromCsvText(csvText);
  const bookings = bookingsFromMatrix(matrix);

  const whiteDonkey = bookings.find(
    (booking) =>
      booking.destination === 'Albania' &&
      booking.name === 'The White Donkey Apartment House' &&
      booking.tier === 'A — super: plaża / ocena / okolica',
  );

  expect(whiteDonkey?.details.propertyName).toBe('The White Donkey Apartment House');
  expect(whiteDonkey?.details.captureQuality).toBe('complete');
  expect(Object.values(whiteDonkey?.details.enrichments ?? {}).every((value) => value.length > 0)).toBe(true);

  const idealApartHotelSaranda = bookings.find(
    (booking) =>
      booking.destination === 'Albania' &&
      booking.name === 'Ideal ApartHotel Saranda' &&
      booking.tier === 'C — po kosztach: prywatna łazienka i rozsądne warunki',
  );

  expect(idealApartHotelSaranda?.details.propertyName).toBe('Ideal ApartHotel Saranda');
  expect(idealApartHotelSaranda?.details.captureQuality).toBe('blocked');
  expect(idealApartHotelSaranda?.details.issues).toContain('Blocked or CAPTCHA page');
});
