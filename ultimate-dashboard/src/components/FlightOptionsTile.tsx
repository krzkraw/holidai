import { useMemo, useState } from 'react';

import {
  FLIGHT_BUCKET_LABELS,
  FLIGHT_OPTIONS,
  FlightBucket,
  FlightOption,
  formatFlightInfo,
  getFlightOptionsForDestination,
  getFlightStayDays,
} from '../data/flights';
import { getFlightFavoriteKey } from '../favorites';
import type { DestinationKey } from '../model';

const FLIGHT_BUCKETS: readonly FlightBucket[] = ['main', 'extra'];

export type FlightOptionsTileProps = {
  destination: DestinationKey;
  favoriteFlightIds?: readonly string[];
  selectedLength: string;
  onFavoriteToggle?: (flight: FlightOption) => void;
};

export function FlightOptionsTile({
  destination,
  favoriteFlightIds = [],
  selectedLength,
  onFavoriteToggle,
}: FlightOptionsTileProps) {
  const [activeBucket, setActiveBucket] = useState<FlightBucket>('main');
  const flights = useMemo(
    () => getFlightOptionsForDestination(FLIGHT_OPTIONS, destination, activeBucket),
    [activeBucket, destination],
  );
  const favoriteFlightIdSet = useMemo(() => new Set(favoriteFlightIds), [favoriteFlightIds]);
  const selectedDates = useMemo(
    () =>
      FLIGHT_OPTIONS.find(
        (flight) =>
          flight.destination === destination &&
          flight.bucket === 'main' &&
          getFlightStayDays(destination, flight) === selectedLength,
      )?.dates,
    [destination, selectedLength],
  );

  return (
    <section className="booking-price-ranges-card flight-options-card" aria-label={`${destination} loty`}>
      <div className="booking-price-ranges-header flight-options-header">
        <div>
          <span className="booking-kicker">Flights</span>
          <h3>Loty według dat i ceny</h3>
        </div>
        <div className="booking-price-ranges-active">
          <span>{selectedLength} dni</span>
          <span>{selectedDates ?? 'inne daty'}</span>
        </div>
      </div>

      <div className="variant-pills flight-options-toggle" aria-label={`${destination} grupy lotów`}>
        {FLIGHT_BUCKETS.map((bucket) => (
          <button
            key={bucket}
            className={activeBucket === bucket ? 'selected' : ''}
            type="button"
            aria-pressed={activeBucket === bucket}
            onClick={() => setActiveBucket(bucket)}
          >
            <span className="control-pill-label">{FLIGHT_BUCKET_LABELS[bucket]}</span>
          </button>
        ))}
      </div>

      <div className="booking-price-ranges-table-wrap flight-options-table-wrap">
        <table className="booking-price-ranges-table flight-options-table">
          <thead>
            <tr>
              <th>PATH</th>
              <th>DATES</th>
              <th>PRICE</th>
              <th>INFO</th>
            </tr>
          </thead>
          <tbody>
            {flights.length > 0 ? (
              flights.map((flight, index) => {
                const stayDays = getFlightStayDays(destination, flight);
                const isFavorite = favoriteFlightIdSet.has(getFlightFavoriteKey(flight));
                const rowClass =
                  stayDays === selectedLength ? 'flight-options-row flight-options-row--active' : 'flight-options-row';

                return (
                  <tr className={rowClass} key={`${flight.bucket}-${flight.path}-${flight.dates}-${flight.price}-${flight.source}-${index}`}>
                    <th>
                      <span className="flight-options-path-cell">
                        {onFavoriteToggle ? (
                          <button
                            className={isFavorite ? 'flight-favorite-toggle flight-favorite-toggle--active' : 'flight-favorite-toggle'}
                            type="button"
                            aria-label={
                              isFavorite
                                ? `Usuń lot ${flight.path} ${flight.dates} z ulubionych`
                                : `Dodaj lot ${flight.path} ${flight.dates} do ulubionych`
                            }
                            aria-pressed={isFavorite}
                            title={isFavorite ? 'Usuń z ulubionych lotów' : 'Dodaj do ulubionych lotów'}
                            onClick={() => onFavoriteToggle(flight)}
                          >
                            <PlaneIcon />
                          </button>
                        ) : null}
                        <span>{flight.path}</span>
                      </span>
                    </th>
                    <td>
                      <span className="flight-options-date-cell">
                        <span>{flight.dates}</span>
                        {stayDays && <small>{stayDays} dni</small>}
                      </span>
                    </td>
                    <td className="booking-price-ranges-cell">{flight.price}</td>
                    <td>{formatFlightInfo(flight)}</td>
                  </tr>
                );
              })
            ) : (
              <tr className="flight-options-row">
                <td colSpan={4}>Brak dodatkowych lotów w logu dla tego kierunku.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PlaneIcon() {
  return (
    <svg className="booking-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16 3 8.5 10.5 3 9l-1 2 4.5 2.5L4 18l2 1 4.5-5.5L18 21l2-1-4-9 5-5a2 2 0 0 0-3-3Z" />
    </svg>
  );
}
