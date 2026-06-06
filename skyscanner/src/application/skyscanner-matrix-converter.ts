import { mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { SkyscannerMatrix } from '../domain/skyscanner-matrix';
import { TsModuleCodec } from '../infrastructure/ts-module-codec';

function bytesEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
}

async function ensureParentDirectory(filePath: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
}

async function readTextPreservingBom(filePath: string): Promise<string> {
  const bytes = await Bun.file(filePath).arrayBuffer();
  return new TextDecoder('utf-8', { ignoreBOM: true }).decode(bytes);
}

export class SkyscannerMatrixConverter {
  async csvFileToTsFile(
    inputCsvPath: string,
    outputTsPath: string,
    exportName = 'skyscannerMatrix',
  ): Promise<SkyscannerMatrix> {
    const csvText = await readTextPreservingBom(inputCsvPath);
    const matrix = SkyscannerMatrix.fromCsvText(csvText);

    await ensureParentDirectory(outputTsPath);
    await Bun.write(outputTsPath, matrix.toTsModuleSource(exportName));

    return matrix;
  }

  async tsFileToCsvFile(
    inputTsPath: string,
    outputCsvPath: string,
    exportName = 'skyscannerMatrix',
  ): Promise<SkyscannerMatrix> {
    const snapshot = await TsModuleCodec.loadSnapshot(inputTsPath, exportName);
    const matrix = SkyscannerMatrix.fromSnapshot(snapshot);

    await ensureParentDirectory(outputCsvPath);
    await Bun.write(outputCsvPath, matrix.toCsvText());

    return matrix;
  }

  async verifyRoundTrip(inputCsvPath: string): Promise<{
    readonly identical: boolean;
    readonly tsPath: string;
    readonly csvPath: string;
  }> {
    const tempDir = join('/tmp', `skyscanner-model-${crypto.randomUUID()}`);
    const tsPath = join(tempDir, 'skyscanner-matrix.ts');
    const csvPath = join(tempDir, 'skyscanner-matrix.csv');

    await mkdir(tempDir, { recursive: true });

    try {
      await this.csvFileToTsFile(inputCsvPath, tsPath);
      await this.tsFileToCsvFile(tsPath, csvPath);

      const inputBytes = new Uint8Array(await Bun.file(inputCsvPath).arrayBuffer());
      const outputBytes = new Uint8Array(await Bun.file(csvPath).arrayBuffer());

      return {
        identical: bytesEqual(inputBytes, outputBytes),
        tsPath,
        csvPath,
      };
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }
}
