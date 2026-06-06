import type { BookingMatrixRow } from './booking-matrix';

function validateIsoDate(date: string, fieldName: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Invalid ${fieldName} date: ${date}`);
  }

  const parsed = Date.parse(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid ${fieldName} date: ${date}`);
  }
}

export class Stay {
  constructor(
    public readonly days: number,
    public readonly checkIn: string,
    public readonly checkOut: string,
    public readonly price: number | null,
  ) {
    if (!Number.isInteger(days) || days <= 0) {
      throw new Error(`Stay days must be a positive integer: ${days}`);
    }

    validateIsoDate(checkIn, 'checkIn');
    validateIsoDate(checkOut, 'checkOut');

    if (price !== null && !Number.isFinite(price)) {
      throw new Error(`Stay price must be a finite number: ${price}`);
    }
  }

  static fromMatrixRow(row: BookingMatrixRow): Stay {
    const days = row.stayDays?.value;
    const rawPrice = row.priceRaw.trim();
    const price = rawPrice === 'TBD' ? null : row.pricePln?.toNumber();

    if (days === undefined || days === null) {
      throw new Error(`Missing stay days for ${row.propertyName}`);
    }

    if (price === undefined) {
      throw new Error(`Missing stay price for ${row.propertyName} (${row.variant}, ${row.country})`);
    }

    return new Stay(days, row.checkIn, row.checkOut, price);
  }
}
