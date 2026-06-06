import { expect, test } from 'bun:test';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

import { BookingModelConverter } from '../src/application/booking-model-converter';
import { BookingMatrix } from '../src/domain/booking-matrix';

async function roundTripFixture(inputPath: string): Promise<{ input: Uint8Array; output: Uint8Array }> {
  const tempDir = join('/tmp', `booking-model-${crypto.randomUUID()}`);
  const converter = new BookingModelConverter();
  const tsPath = join(tempDir, 'booking-matrix.ts');
  const csvPath = join(tempDir, 'booking-matrix.csv');

  await mkdir(tempDir, { recursive: true });

  try {
    await converter.csvFileToTsFile(inputPath, tsPath);
    await converter.tsFileToCsvFile(tsPath, csvPath);

    const input = new Uint8Array(await Bun.file(inputPath).arrayBuffer());
    const output = new Uint8Array(await Bun.file(csvPath).arrayBuffer());
    return { input, output };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

test('csv -> ts -> csv preserves destinations-final.csv byte-for-byte', async () => {
  const { input, output } = await roundTripFixture('destinations-final.csv');
  expect(output).toEqual(input);
});

test('booking matrix exposes page-content from destinations-final.csv', async () => {
  const csvText = await Bun.file('destinations-final.csv').text();
  const matrix = BookingMatrix.fromCsvText(csvText);

  expect(matrix.rows[0]?.pageContent).toBe(
    'scrape/ALBANIA/booking_matrix_albania_MD/Albania-The White Donkey Apartment House.md',
  );
  expect(matrix.rows[0]?.checkIn).toBe('2026-09-16');
  expect(matrix.rows[0]?.checkOut).toBe('2026-09-24');

  for (const row of matrix.rows) {
    const checkIn = new Date(`${row.checkIn}T00:00:00Z`);
    const checkOut = new Date(`${row.checkOut}T00:00:00Z`);
    const computedDays = Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000);
    expect(computedDays).toBe(row.stayDays?.value);
  }
});
