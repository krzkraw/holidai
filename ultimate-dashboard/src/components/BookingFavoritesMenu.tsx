import { useEffect, useMemo, useRef, useState } from 'react';

import { BookingJson, formatStayPrice } from '../data/bookings';
import { getBookingFavoriteKey } from '../favorites';
import type { DestinationKey } from '../model';
import { BookingReportPortal } from './BookingCard';

export type BookingFavoritesMenuProps = {
  destination: DestinationKey;
  favoriteBookings: readonly BookingJson[];
  selectedBookingKey?: string;
  selectedStayDays: number | string;
  onRemoveFavorite: (booking: BookingJson) => void;
  onSelectFavorite?: (booking: BookingJson) => void;
};

export function BookingFavoritesMenu({
  destination,
  favoriteBookings,
  selectedBookingKey,
  selectedStayDays,
  onRemoveFavorite,
  onSelectFavorite,
}: BookingFavoritesMenuProps) {
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
        favoriteKey: getBookingFavoriteKey(booking),
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
        <HomeIcon />
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
            {favoriteRows.map(({ booking, favoriteKey, stays }) => (
              <div className="booking-favorite-row-shell" role="none" key={booking.url}>
                <button
                  className={selectedBookingKey === favoriteKey ? 'booking-favorite-row booking-favorite-row--selected' : 'booking-favorite-row'}
                  type="button"
                  role="menuitem"
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
                {onSelectFavorite ? (
                  <button
                    className={
                      selectedBookingKey === favoriteKey
                        ? 'booking-favorite-select booking-favorite-select--active'
                        : 'booking-favorite-select'
                    }
                    type="button"
                    aria-label={`Wybierz ${booking.name} jako hotel`}
                    aria-pressed={selectedBookingKey === favoriteKey}
                    title="Wybierz jako hotel"
                    onClick={() => onSelectFavorite(booking)}
                  >
                    ✓
                  </button>
                ) : null}
                <button
                  className="booking-favorite-remove"
                  type="button"
                  aria-label={`Usuń ${booking.name} z listy ulubionych`}
                  title="Usuń z ulubionych"
                  onClick={() => onRemoveFavorite(booking)}
                >
                  X
                </button>
              </div>
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

function HomeIcon() {
  return (
    <svg className="booking-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 11 12 3l9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}
