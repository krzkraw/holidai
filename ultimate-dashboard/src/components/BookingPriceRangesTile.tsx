import { useMemo } from 'react';

import { BookingJson, formatPriceRange, getPriceRangeForDestination } from '../data/bookings';
import type { DestinationKey } from '../model';

export type BookingPriceRangesTileProps = {
  bookings: readonly BookingJson[];
  destination: DestinationKey;
  lengths: readonly string[];
  variants: readonly string[];
  selectedLength: string;
  selectedVariant: string;
};

export function BookingPriceRangesTile({
  bookings,
  destination,
  lengths,
  variants,
  selectedLength,
  selectedVariant,
}: BookingPriceRangesTileProps) {
  const rows = useMemo(
    () =>
      lengths.map((length) => ({
        length,
        ranges: variants.map((variant) => ({
          variant,
          label: getVariantLabel(variant),
          value: formatPriceRange(getPriceRangeForDestination(bookings, destination, variant, length)),
        })),
      })),
    [bookings, destination, lengths, variants],
  );

  return (
    <section className="booking-price-ranges-card" aria-label={`${destination} zakresy cen hoteli`}>
      <div className="booking-price-ranges-header">
        <div>
          <span className="booking-kicker">Price ranges</span>
          <h3>Zakres cen według pobytu i kategorii</h3>
        </div>
        <div className="booking-price-ranges-active">
          <span>{selectedLength} dni</span>
          <span>{getVariantLabel(selectedVariant)}</span>
        </div>
      </div>

      <div className="booking-price-ranges-table-wrap">
        <table className="booking-price-ranges-table">
          <thead>
            <tr>
              <th>Okres</th>
              {variants.map((variant) => (
                <th key={variant} title={variant}>
                  {getVariantLabel(variant)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.length}>
                <th>{row.length} dni</th>
                {row.ranges.map((range) => (
                  <td
                    key={`${row.length}-${range.variant}`}
                    className={
                      row.length === selectedLength && range.variant === selectedVariant
                        ? 'booking-price-ranges-cell booking-price-ranges-cell--active'
                        : 'booking-price-ranges-cell'
                    }
                    title={range.variant}
                  >
                    {range.value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function getVariantLabel(variant: string): string {
  return variant.trim().slice(0, 1) || variant;
}
