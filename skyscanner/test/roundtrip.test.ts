import { expect, test } from 'bun:test';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

import { SkyscannerMatrixConverter } from '../src/application/skyscanner-matrix-converter';

async function roundTripFixture(inputPath: string): Promise<{ input: Uint8Array; output: Uint8Array }> {
  const tempDir = join('/tmp', `skyscanner-model-${crypto.randomUUID()}`);
  const converter = new SkyscannerMatrixConverter();
  const tsPath = join(tempDir, 'skyscanner-matrix.ts');
  const csvPath = join(tempDir, 'skyscanner-matrix.csv');

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

test('csv -> ts -> csv preserves the Albania/Greece/Cyprus Skyscanner matrix byte-for-byte', async () => {
  const { input, output } = await roundTripFixture('research/skyscanner_matrix_albania_grecja_cypr.csv');
  expect(output).toEqual(input);
});

test('csv -> ts -> csv preserves the Turkey/Crete Skyscanner matrix byte-for-byte', async () => {
  const { input, output } = await roundTripFixture('research/skyscanner_matrix_turcja_kreta.csv');
  expect(output).toEqual(input);
});
