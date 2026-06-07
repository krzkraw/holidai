import { BookingJson, getStayForDays } from './data/bookings';
import { FlightOption, parseFlightPrice } from './data/flights';

export type TripTotal = {
  hotel: number;
  flight: number;
  total: number;
};

export type TripTotalRange = {
  min: number;
  max: number;
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

export function calculateTripTotalRange(
  bookings: readonly BookingJson[],
  selectedStayDays: number | string,
  flights: readonly FlightOption[],
): TripTotalRange | null {
  let min: number | null = null;
  let max: number | null = null;

  for (const booking of bookings) {
    for (const flight of flights) {
      const total = calculateTripTotal(booking, selectedStayDays, flight);

      if (!total) {
        continue;
      }

      min = min === null ? total.total : Math.min(min, total.total);
      max = max === null ? total.total : Math.max(max, total.total);
    }
  }

  if (min === null || max === null) {
    return null;
  }

  return { min, max };
}

export function formatTripTotal(total: Pick<TripTotal, 'total'>): string {
  return `${formatPlnNumber(total.total)} PLN`;
}

export function formatTripTotalRange(range: TripTotalRange | null | undefined): string | null {
  if (!range) {
    return null;
  }

  if (range.min === range.max) {
    return `${formatPlnNumber(range.min)} PLN`;
  }

  return `${formatPlnNumber(range.min)}-${formatPlnNumber(range.max)} PLN`;
}

function formatPlnNumber(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
