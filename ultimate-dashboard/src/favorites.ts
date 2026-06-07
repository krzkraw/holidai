import { BookingJson } from './data/bookings';
import { FlightOption } from './data/flights';
import type { DestinationKey } from './model';

export type FavoriteBookingsByDestination = Partial<Record<DestinationKey, readonly string[]>>;
export type FavoriteFlightsByDestination = Partial<Record<DestinationKey, readonly string[]>>;

export function getBookingFavoriteKey(booking: BookingJson): string {
  return booking.url || `${booking.destination}:${booking.tier}:${booking.name}`;
}

export function getFlightFavoriteKey(flight: FlightOption): string {
  return [
    flight.bucket,
    flight.destination,
    flight.path,
    flight.dates,
    flight.price,
    flight.info,
    flight.source,
  ].join('|');
}

export function isBookingFavorite(
  favorites: FavoriteBookingsByDestination,
  destination: DestinationKey,
  booking: BookingJson,
): boolean {
  return (favorites[destination] ?? []).includes(getBookingFavoriteKey(booking));
}

export function toggleFavoriteBooking(
  favorites: FavoriteBookingsByDestination,
  destination: DestinationKey,
  booking: BookingJson,
): FavoriteBookingsByDestination {
  const key = getBookingFavoriteKey(booking);
  const currentKeys = favorites[destination] ?? [];
  const nextKeys = currentKeys.includes(key) ? currentKeys.filter((item) => item !== key) : [...currentKeys, key];

  return { ...favorites, [destination]: nextKeys };
}

export function getFavoriteBookingsForDestination(
  bookings: readonly BookingJson[],
  destination: DestinationKey,
  favorites: FavoriteBookingsByDestination,
): readonly BookingJson[] {
  const favoriteKeys = favorites[destination] ?? [];
  const bookingsByKey = new Map(
    bookings
      .filter((booking) => booking.destination === destination)
      .map((booking) => [getBookingFavoriteKey(booking), booking]),
  );

  return favoriteKeys.flatMap((key) => {
    const booking = bookingsByKey.get(key);
    return booking ? [booking] : [];
  });
}

export function isFlightFavorite(
  favorites: FavoriteFlightsByDestination,
  destination: DestinationKey,
  flight: FlightOption,
): boolean {
  return (favorites[destination] ?? []).includes(getFlightFavoriteKey(flight));
}

export function toggleFavoriteFlight(
  favorites: FavoriteFlightsByDestination,
  destination: DestinationKey,
  flight: FlightOption,
): FavoriteFlightsByDestination {
  const key = getFlightFavoriteKey(flight);
  const currentKeys = favorites[destination] ?? [];
  const nextKeys = currentKeys.includes(key) ? currentKeys.filter((item) => item !== key) : [...currentKeys, key];

  return { ...favorites, [destination]: nextKeys };
}

export function getFavoriteFlightsForDestination(
  flights: readonly FlightOption[],
  destination: DestinationKey,
  favorites: FavoriteFlightsByDestination,
): readonly FlightOption[] {
  const favoriteKeys = favorites[destination] ?? [];
  const flightsByKey = new Map(
    flights
      .filter((flight) => flight.destination === destination)
      .map((flight) => [getFlightFavoriteKey(flight), flight]),
  );

  return favoriteKeys.flatMap((key) => {
    const flight = flightsByKey.get(key);
    return flight ? [flight] : [];
  });
}
