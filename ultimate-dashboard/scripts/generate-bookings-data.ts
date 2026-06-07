import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { bookingsFromMatrix, type Booking } from '../../booking-model/src/domain/booking';
import { BookingMatrix } from '../../booking-model/src/domain/booking-matrix';

const currentModulePath = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(currentModulePath), '..', '..');

export const DEFAULT_INPUT_CSV_PATH = resolve(repoRoot, 'destinations-final.csv');
export const DEFAULT_OUTPUT_JSON_PATH = resolve(repoRoot, 'ultimate-dashboard', 'data', 'bookings', 'bookings.json');

export type GenerateBookingsDataOptions = {
  inputCsvPath?: string;
  outputJsonPath?: string;
};

export type GenerateBookingsDataResult = {
  inputCsvPath: string;
  outputJsonPath: string;
  bookingCount: number;
};

function readTextPreservingBom(filePath: string): string {
  const bytes = readFileSync(filePath);
  return new TextDecoder('utf-8', { ignoreBOM: true }).decode(bytes);
}

export function buildBookingsFromCsvText(csvText: string): readonly Booking[] {
  const matrix = BookingMatrix.fromCsvText(csvText);
  return bookingsFromMatrix(matrix);
}

export function serializeBookings(bookings: readonly unknown[]): string {
  return `${JSON.stringify(bookings, null, 2)}\n`;
}

export function generateBookingsData(options: GenerateBookingsDataOptions = {}): GenerateBookingsDataResult {
  const inputCsvPath = options.inputCsvPath ?? DEFAULT_INPUT_CSV_PATH;
  const outputJsonPath = options.outputJsonPath ?? DEFAULT_OUTPUT_JSON_PATH;
  const bookings = buildBookingsFromCsvText(readTextPreservingBom(inputCsvPath));

  mkdirSync(dirname(outputJsonPath), { recursive: true });
  writeFileSync(outputJsonPath, serializeBookings(bookings), 'utf8');

  return {
    inputCsvPath,
    outputJsonPath,
    bookingCount: bookings.length,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === currentModulePath) {
  const result = generateBookingsData();
  console.log(`Wrote ${result.bookingCount} bookings to ${result.outputJsonPath}`);
}
