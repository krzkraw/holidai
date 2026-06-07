import { useMemo } from 'react';

import { BookingJson, getBookingsForDestination } from '../data/bookings';
import type { DestinationKey } from '../model';
import { BookingCard } from './BookingCard';

export type BookingGridProps = {
  bookings: readonly BookingJson[];
  destination: DestinationKey;
  selectedLength: string;
  selectedVariant: string;
};

export function BookingGrid({ bookings, destination, selectedLength, selectedVariant }: BookingGridProps) {
  const selectedStayDays = Number.parseInt(selectedLength, 10);
  const selectedBookings = useMemo(
    () => getBookingsForDestination(bookings, destination, selectedVariant, selectedStayDays),
    [bookings, destination, selectedStayDays, selectedVariant],
  );

  return (
    <div className="booking-grid-shell">
      <div className="booking-grid-heading">
        <div>
          <span className="booking-kicker">Booking.com matrix</span>
          <h3>{destination}: {selectedBookings.length} hoteli</h3>
        </div>
        <div className="booking-grid-context" aria-label={`${destination} aktywne filtry`}>
          <span>{selectedLength} dni</span>
          <span>{selectedVariant}</span>
        </div>
      </div>

      {selectedBookings.length > 0 ? (
        <div className="booking-grid" aria-label={`${destination} hotele dla wariantu ${selectedVariant}`}>
          {selectedBookings.map((booking) => (
            <BookingCard key={`${booking.destination}-${booking.tier}-${booking.name}`} booking={booking} selectedStayDays={selectedStayDays} />
          ))}
        </div>
      ) : (
        <div className="booking-empty" role="status">
          <strong>Brak hoteli dla aktywnego filtra</strong>
          <span>Dane mogą się jeszcze ładować albo wariant nie występuje w `bookings.json.gz`.</span>
        </div>
      )}
    </div>
  );
}
