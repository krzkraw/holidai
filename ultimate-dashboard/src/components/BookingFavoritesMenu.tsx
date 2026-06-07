import { useEffect, useMemo, useRef, useState } from 'react';

import { BookingJson, formatStayPrice } from '../data/bookings';
import type { DestinationKey } from '../model';
import { BookingReportPortal } from './BookingCard';

export type BookingFavoritesMenuProps = {
  destination: DestinationKey;
  favoriteBookings: readonly BookingJson[];
  selectedStayDays: number | string;
};

export function BookingFavoritesMenu({ destination, favoriteBookings, selectedStayDays }: BookingFavoritesMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reportBooking, setReportBooking] = useState<BookingJson | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuId = `booking-favorites-${destination.toLowerCase()}`;
  const favoritesCount = favoriteBookings.length;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (favoritesCount === 0) {
      setIsOpen(false);
      setReportBooking(null);
    }
  }, [favoritesCount]);

  const favoriteRows = useMemo(
    () =>
      favoriteBookings.map((booking) => ({
        booking,
        stays: [...booking.stays].sort((left, right) => left.days - right.days),
      })),
    [favoriteBookings],
  );

  if (favoritesCount === 0) {
    return null;
  }

  return (
    <div className="booking-favorites-menu" ref={menuRef}>
      <button
        className="booking-favorites-button"
        type="button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span aria-hidden="true">★</span>
        <strong>{favoritesCount}</strong>
      </button>

      {isOpen ? (
        <div className="booking-favorites-popover" id={menuId} role="menu">
          <div className="booking-favorites-popover-header">
            <span className="booking-kicker">Ulubione</span>
            <strong>
              {destination}: {favoritesCount}
            </strong>
          </div>
          <div className="booking-favorites-list">
            {favoriteRows.map(({ booking, stays }) => (
              <button
                className="booking-favorite-row"
                type="button"
                role="menuitem"
                key={booking.url}
                onClick={() => {
                  setReportBooking(booking);
                  setIsOpen(false);
                }}
              >
                <span className="booking-favorite-row-name">{booking.name}</span>
                <span className="booking-favorite-row-prices" aria-label={`${booking.name} ceny pobytów`}>
                  {stays.map((stay) => (
                    <span key={`${booking.url}-${stay.days}`}>
                      {stay.days}d <b>{formatStayPrice(stay)}</b>
                    </span>
                  ))}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {reportBooking ? (
        <BookingReportPortal
          booking={reportBooking}
          selectedStayDays={selectedStayDays}
          onClose={() => setReportBooking(null)}
        />
      ) : null}
    </div>
  );
}
