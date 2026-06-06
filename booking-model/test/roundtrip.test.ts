import { expect, test } from 'bun:test';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

import { BookingModelConverter } from '../src/application/booking-model-converter';

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

test('csv -> ts -> csv preserves the Albania/Greece/Cyprus matrix byte-for-byte', async () => {
  const { input, output } = await roundTripFixture('research/booking_matrix_albania_grecja_cypr.csv');
  expect(output).toEqual(input);
});

test('csv -> ts -> csv preserves the Turkey/Crete matrix byte-for-byte', async () => {
  const { input, output } = await roundTripFixture('research/booking_matrix_turcja_kreta.csv');
  expect(output).toEqual(input);
});

test('csv -> ts -> csv preserves the legacy ultimate matrix byte-for-byte', async () => {
  const { input, output } = await roundTripFixture('gpt/sources/ultimate_booking_matrix.csv');
  expect(output).toEqual(input);
});
