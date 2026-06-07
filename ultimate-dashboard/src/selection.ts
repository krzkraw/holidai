import { BookingJson, getStayForDays } from './data/bookings';
import { FlightOption, parseFlightPrice } from './data/flights';

export type TripTotal = {
  hotel: number;
  flight: number;
  total: number;
};

export function calculateTripTotal(
  booking: BookingJson | null | undefined,
  selectedStayDays: number | string,
  flight: FlightOption | null | undefined,
): TripTotal | null {
  if (!booking || !flight) {
    return null;
  }

  const hotelPrice = getStayForDays(booking, selectedStayDays)?.price ?? null;
  const flightPrice = parseFlightPrice(flight);

  if (hotelPrice === null || flightPrice === null) {
    return null;
  }

  return {
    hotel: hotelPrice,
    flight: flightPrice,
    total: hotelPrice + flightPrice,
  };
}

export function formatTripTotal(total: Pick<TripTotal, 'total'>): string {
  return `${total.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} PLN`;
}
