import { PropertyPageRepository } from '../infrastructure/property-page-repository';
import type { BookingMatrix, BookingMatrixRow } from './booking-matrix';
import type { ScrapedPropertyPage } from './scraped-property-page';
import { Stay } from './stay';

function stripStayDates(url: string): string {
  const parsed = new URL(url);
  parsed.searchParams.delete('checkin');
  parsed.searchParams.delete('checkout');
  return parsed.toString();
}

function assertConsistent<T>(
  rows: readonly BookingMatrixRow[],
  fieldName: string,
  getter: (row: BookingMatrixRow) => T,
): T {
  if (rows.length === 0) {
    throw new Error('Booking requires at least one stay row');
  }

  const first = getter(rows[0]);
  for (let index = 1; index < rows.length; index += 1) {
    const current = getter(rows[index]);
    if (current !== first) {
      throw new Error(`Inconsistent ${fieldName} within booking ${rows[0].country} / ${rows[0].propertyName} / ${rows[0].variant}`);
    }
  }

  return first;
}

function requireNumber(value: number | null, fieldName: string, bookingLabel: string): number {
  if (value === null) {
    throw new Error(`Missing required numeric field ${fieldName} for booking ${bookingLabel}`);
  }

  return value;
}

const propertyPageRepository = new PropertyPageRepository();

export class Booking {
  constructor(
    public readonly destination: string,
    public readonly tier: string,
    public readonly name: string,
    public readonly rating: number | null,
    public readonly reviews: number,
    public readonly laundry: string,
    public readonly washingMachineConfirmed: boolean,
    public readonly washingMachineOnlyInReviews: boolean,
    public readonly laundryService: boolean,
    public readonly kitchen: boolean,
    public readonly privateBathroom: boolean,
    public readonly beachView: boolean,
    public readonly seaView: boolean,
    public readonly parking: boolean,
    public readonly beachInfo: string,
    public readonly evaluation: number,
    public readonly pageContent: string,
    public readonly details: ScrapedPropertyPage,
    public readonly url: string,
    public readonly stays: readonly Stay[],
  ) {
    if (stays.length === 0) {
      throw new Error(`Booking ${destination} / ${name} / ${tier} requires at least one stay`);
    }
  }

  static fromMatrixRows(rows: readonly BookingMatrixRow[]): Booking {
    const destination = assertConsistent(rows, 'destination', (row) => row.country);
    const tier = assertConsistent(rows, 'tier', (row) => row.variant);
    const name = assertConsistent(rows, 'name', (row) => row.propertyName);
    const rating = assertConsistent(rows, 'rating', (row) => row.bookingScore?.toNumber() ?? null);
    const reviews = requireNumber(assertConsistent(rows, 'reviews', (row) => row.reviewCount), 'reviews', `${destination} / ${name} / ${tier}`);
    const laundry = assertConsistent(rows, 'laundry', (row) => row.statusPrania);
    const washingMachineConfirmed = assertConsistent(rows, 'washingMachineConfirmed', (row) => row.washerConfirmed.value);
    const washingMachineOnlyInReviews = assertConsistent(rows, 'washingMachineOnlyInReviews', (row) => row.washerOnlyInReview.value);
    const laundryService = assertConsistent(rows, 'laundryService', (row) => row.laundryService.value);
    const kitchen = assertConsistent(rows, 'kitchen', (row) => row.kitchen.value);
    const privateBathroom = assertConsistent(rows, 'privateBathroom', (row) => row.privateBathroom.value);
    const beachView = assertConsistent(rows, 'beachView', (row) => row.beachfront.value);
    const seaView = assertConsistent(rows, 'seaView', (row) => row.seaView.value);
    const parking = assertConsistent(rows, 'parking', (row) => row.parking.value);
    const beachInfo = assertConsistent(rows, 'beachInfo', (row) => row.beachInfo);
    const evaluation = requireNumber(
      assertConsistent(rows, 'evaluation', (row) => row.selectionScore?.toNumber() ?? null),
      'evaluation',
      `${destination} / ${name} / ${tier}`,
    );
    const pageContent = assertConsistent(rows, 'pageContent', (row) => row.pageContent);
    const details = propertyPageRepository.loadByPageContent(pageContent);
    const url = assertConsistent(rows, 'url', (row) => stripStayDates(row.bookingUrl));

    const stays = [...rows]
      .map((row) => Stay.fromMatrixRow(row))
      .sort((left, right) => left.days - right.days);

    return new Booking(
      destination,
      tier,
      name,
      rating,
      reviews,
      laundry,
      washingMachineConfirmed,
      washingMachineOnlyInReviews,
      laundryService,
      kitchen,
      privateBathroom,
      beachView,
      seaView,
      parking,
      beachInfo,
      evaluation,
      pageContent,
      details,
      url,
      stays,
    );
  }
}

export function bookingsFromMatrix(matrix: BookingMatrix): readonly Booking[] {
  const grouped = new Map<string, BookingMatrixRow[]>();

  for (const row of matrix.rows) {
    const key = `${row.country}\u0000${row.propertyName}\u0000${row.variant}`;
    const bucket = grouped.get(key);
    if (bucket === undefined) {
      grouped.set(key, [row]);
      continue;
    }

    bucket.push(row);
  }

  return [...grouped.values()].map((rows) => Booking.fromMatrixRows(rows));
}
