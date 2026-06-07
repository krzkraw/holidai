import { useEffect, useRef, useState } from 'react';

import { FlightOption, formatFlightInfo } from '../data/flights';
import { getFlightFavoriteKey } from '../favorites';
import type { DestinationKey } from '../model';

export type FlightFavoritesMenuProps = {
  destination: DestinationKey;
  favoriteFlights: readonly FlightOption[];
  selectedFlightKey?: string;
  onRemoveFavorite: (flight: FlightOption) => void;
  onSelectFavorite: (flight: FlightOption) => void;
};

export function FlightFavoritesMenu({
  destination,
  favoriteFlights,
  selectedFlightKey,
  onRemoveFavorite,
  onSelectFavorite,
}: FlightFavoritesMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuId = `flight-favorites-${destination.toLowerCase()}`;
  const favoritesCount = favoriteFlights.length;

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
    }
  }, [favoritesCount]);

  if (favoritesCount === 0) {
    return null;
  }

  return (
    <div className="booking-favorites-menu flight-favorites-menu" ref={menuRef}>
      <button
        className="booking-favorites-button flight-favorites-button"
        type="button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => setIsOpen((current) => !current)}
      >
        <PlaneIcon />
        <strong>{favoritesCount}</strong>
      </button>

      {isOpen ? (
        <div className="booking-favorites-popover flight-favorites-popover" id={menuId} role="menu">
          <div className="booking-favorites-popover-header">
            <span className="booking-kicker">Ulubione loty</span>
            <strong>
              {destination}: {favoritesCount}
            </strong>
          </div>
          <div className="booking-favorites-list">
            {favoriteFlights.map((flight) => {
              const favoriteKey = getFlightFavoriteKey(flight);
              const selected = selectedFlightKey === favoriteKey;

              return (
                <div className="booking-favorite-row-shell" role="none" key={favoriteKey}>
                  <div className={selected ? 'booking-favorite-row booking-favorite-row--selected' : 'booking-favorite-row'}>
                    <span className="booking-favorite-row-name">
                      {flight.path} · {flight.dates}
                    </span>
                    <span className="booking-favorite-row-prices" aria-label={`${flight.path} lot`}>
                      <span>
                        Cena <b>{flight.price}</b>
                      </span>
                      <span>{formatFlightInfo(flight)}</span>
                    </span>
                  </div>
                  <button
                    className={selected ? 'booking-favorite-select booking-favorite-select--active' : 'booking-favorite-select'}
                    type="button"
                    aria-label={`Wybierz lot ${flight.path} ${flight.dates}`}
                    aria-pressed={selected}
                    title="Wybierz jako lot"
                    onClick={() => onSelectFavorite(flight)}
                  >
                    ✓
                  </button>
                  <button
                    className="booking-favorite-remove"
                    type="button"
                    aria-label={`Usuń lot ${flight.path} ${flight.dates} z listy ulubionych`}
                    title="Usuń z ulubionych"
                    onClick={() => onRemoveFavorite(flight)}
                  >
                    X
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PlaneIcon() {
  return (
    <svg className="booking-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16 3 8.5 10.5 3 9l-1 2 4.5 2.5L4 18l2 1 4.5-5.5L18 21l2-1-4-9 5-5a2 2 0 0 0-3-3Z" />
    </svg>
  );
}
