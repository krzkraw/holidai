import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

import { bookingsFromMatrix, type Booking } from '../../booking-model/src/domain/booking';
import { BookingMatrix } from '../../booking-model/src/domain/booking-matrix';

const currentModulePath = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(currentModulePath), '..', '..');

export const DEFAULT_INPUT_CSV_PATH = resolve(repoRoot, 'destinations-final.csv');
export const DEFAULT_OUTPUT_JSON_PATH = resolve(repoRoot, 'ultimate-dashboard', 'data', 'bookings', 'bookings.json');
export const DEFAULT_OUTPUT_GZIP_PATH = resolve(repoRoot, 'ultimate-dashboard', 'public', 'data', 'bookings', 'bookings.json.gz');

export type GenerateBookingsDataOptions = {
  inputCsvPath?: string;
  outputJsonPath?: string;
  outputGzipPath?: string;
};

export type GenerateBookingsDataResult = {
  inputCsvPath: string;
  outputJsonPath: string;
  outputGzipPath: string;
  bookingCount: number;
  jsonBytes: number;
  gzipBytes: number;
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

export function compressBookingsJson(jsonText: string): Buffer {
  return gzipSync(jsonText, { level: 9 });
}

export function generateBookingsData(options: GenerateBookingsDataOptions = {}): GenerateBookingsDataResult {
  const inputCsvPath = options.inputCsvPath ?? DEFAULT_INPUT_CSV_PATH;
  const outputJsonPath = options.outputJsonPath ?? DEFAULT_OUTPUT_JSON_PATH;
  const outputGzipPath = options.outputGzipPath ?? DEFAULT_OUTPUT_GZIP_PATH;
  const bookings = buildBookingsFromCsvText(readTextPreservingBom(inputCsvPath));
  const jsonText = serializeBookings(bookings);
  const gzipBytes = compressBookingsJson(jsonText);

  mkdirSync(dirname(outputJsonPath), { recursive: true });
  writeFileSync(outputJsonPath, jsonText, 'utf8');
  mkdirSync(dirname(outputGzipPath), { recursive: true });
  writeFileSync(outputGzipPath, gzipBytes);

  return {
    inputCsvPath,
    outputJsonPath,
    outputGzipPath,
    bookingCount: bookings.length,
    jsonBytes: Buffer.byteLength(jsonText),
    gzipBytes: gzipBytes.length,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === currentModulePath) {
  const result = generateBookingsData();
  console.log(
    `Wrote ${result.bookingCount} bookings to ${result.outputJsonPath} and ${result.outputGzipPath} (${result.gzipBytes}/${result.jsonBytes} bytes)`,
  );
}
