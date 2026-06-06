import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

import { BookingModelConverter } from './application/booking-model-converter';

function printUsage(): void {
  console.error([
    'Usage:',
    '  bun run booking-model/src/cli.ts csv-to-ts <input.csv> <output.ts> [exportName]',
    '  bun run booking-model/src/cli.ts ts-to-csv <input.ts> <output.csv> [exportName]',
    '  bun run booking-model/src/cli.ts roundtrip <input.csv>',
  ].join('\n'));
}

async function ensureParentDirectory(filePath: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
}

async function main(): Promise<number> {
  const [command, ...args] = process.argv.slice(2);
  const converter = new BookingModelConverter();

  if (!command) {
    printUsage();
    return 1;
  }

  if (command === 'csv-to-ts') {
    const [inputCsvPath, outputTsPath, exportName] = args;
    if (!inputCsvPath || !outputTsPath) {
      printUsage();
      return 1;
    }

    await ensureParentDirectory(outputTsPath);
    await converter.csvFileToTsFile(inputCsvPath, outputTsPath, exportName ?? 'bookingMatrix');
    console.log(`Wrote TS snapshot to ${outputTsPath}`);
    return 0;
  }

  if (command === 'ts-to-csv') {
    const [inputTsPath, outputCsvPath, exportName] = args;
    if (!inputTsPath || !outputCsvPath) {
      printUsage();
      return 1;
    }

    await ensureParentDirectory(outputCsvPath);
    await converter.tsFileToCsvFile(inputTsPath, outputCsvPath, exportName ?? 'bookingMatrix');
    console.log(`Wrote CSV to ${outputCsvPath}`);
    return 0;
  }

  if (command === 'roundtrip') {
    const [inputCsvPath] = args;
    if (!inputCsvPath) {
      printUsage();
      return 1;
    }

    const result = await converter.verifyRoundTrip(inputCsvPath);
    if (!result.identical) {
      console.error(`Roundtrip mismatch for ${inputCsvPath}`);
      return 2;
    }

    console.log(`Roundtrip identical for ${inputCsvPath}`);
    return 0;
  }

  printUsage();
  return 1;
}

if (import.meta.main) {
  const exitCode = await main();
  if (exitCode !== 0) {
    process.exitCode = exitCode;
  }
}
