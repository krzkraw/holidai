import { useMemo, useState } from 'react';

import {
  FLIGHT_BUCKET_LABELS,
  FLIGHT_OPTIONS,
  FlightBucket,
  formatFlightInfo,
  getFlightOptionsForDestination,
  getFlightStayDays,
} from '../data/flights';
import type { DestinationKey } from '../model';

const FLIGHT_BUCKETS: readonly FlightBucket[] = ['main', 'extra'];

export type FlightOptionsTileProps = {
  destination: DestinationKey;
  selectedLength: string;
};

export function FlightOptionsTile({ destination, selectedLength }: FlightOptionsTileProps) {
  const [activeBucket, setActiveBucket] = useState<FlightBucket>('main');
  const flights = useMemo(
    () => getFlightOptionsForDestination(FLIGHT_OPTIONS, destination, activeBucket),
    [activeBucket, destination],
  );
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
                const rowClass =
                  stayDays === selectedLength ? 'flight-options-row flight-options-row--active' : 'flight-options-row';

                return (
                  <tr className={rowClass} key={`${flight.bucket}-${flight.path}-${flight.dates}-${flight.price}-${flight.source}-${index}`}>
                    <th>{flight.path}</th>
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
