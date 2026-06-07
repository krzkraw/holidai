import { expect, test } from 'bun:test';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { PropertyPageConverter } from '../src/application/property-page-converter';
import { PropertyPageJsonCodec } from '../src/infrastructure/property-page-json-codec';

async function readText(path: string): Promise<string> {
  return Bun.file(path).text();
}

async function writeFixtureCopy(sourcePath: string, targetPath: string): Promise<void> {
  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, await readText(sourcePath), 'utf8');
}

test('exports a single markdown page to deterministic JSON', async () => {
  const tempDir = join('/tmp', `booking-model-${crypto.randomUUID()}`);
  const converter = new PropertyPageConverter();
  const inputMarkdownPath = '/Users/krz/Dev/holidai/scrape/GRECJA/booking_matrix_grecja_MD/Grecja-Calypso Studios.md';
  const outputJsonPath = join(tempDir, 'Grecja-Calypso Studios.json');

  await mkdir(tempDir, { recursive: true });

  try {
    await converter.markdownFileToJsonFile(inputMarkdownPath, outputJsonPath);

    const jsonText = await readText(outputJsonPath);
    const page = PropertyPageJsonCodec.deserialize(jsonText);

    expect(page.title).toBe('Grecja - Calypso Studios');
    expect(page.country).toBe('Grecja');
    expect(page.propertyName).toBe('Calypso Studios');
    expect(page.captureQuality).toBe('complete');
    expect(page.imageUrls.length).toBeGreaterThan(0);
    expect(Object.values(page.enrichments)).toEqual(['', '', '', '', '', '', '', '']);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('exports a markdown directory tree to a mirrored JSON tree', async () => {
  const tempDir = join('/tmp', `booking-model-${crypto.randomUUID()}`);
  const sourceRoot = join(tempDir, 'source');
  const outputRoot = join(tempDir, 'output');
  const converter = new PropertyPageConverter();

  const sourceA = '/Users/krz/Dev/holidai/scrape/ALBANIA/booking_matrix_albania_MD/Albania-Ideal ApartHotel Saranda.md';
  const sourceB = '/Users/krz/Dev/holidai/scrape/GRECJA/booking_matrix_grecja_MD/Grecja-Panorama.md';

  await mkdir(sourceRoot, { recursive: true });
  await mkdir(outputRoot, { recursive: true });

  try {
    await writeFixtureCopy(sourceA, join(sourceRoot, 'ALBANIA/booking_matrix_albania_MD/Albania-Ideal ApartHotel Saranda.md'));
    await writeFixtureCopy(sourceB, join(sourceRoot, 'GRECJA/booking_matrix_grecja_MD/Grecja-Panorama.md'));
    await writeFixtureCopy(sourceB, join(sourceRoot, 'notes.md'));

    const writtenPaths = await converter.markdownTreeToJsonTree(sourceRoot, outputRoot);

    expect(writtenPaths).toEqual([
      join(outputRoot, 'ALBANIA/booking_matrix_albania_MD/Albania-Ideal ApartHotel Saranda.json'),
      join(outputRoot, 'GRECJA/booking_matrix_grecja_MD/Grecja-Panorama.json'),
    ]);
    expect(await Bun.file(join(outputRoot, 'ALBANIA/booking_matrix_albania_MD/Albania-Ideal ApartHotel Saranda.json')).exists()).toBe(true);
    expect(await Bun.file(join(outputRoot, 'GRECJA/booking_matrix_grecja_MD/Grecja-Panorama.json')).exists()).toBe(true);
    expect(await Bun.file(join(outputRoot, 'notes.json')).exists()).toBe(false);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('exports blocked pages with empty enrichments and blocked metadata intact', async () => {
  const tempDir = join('/tmp', `booking-model-${crypto.randomUUID()}`);
  const converter = new PropertyPageConverter();
  const inputMarkdownPath = '/Users/krz/Dev/holidai/scrape/kreta/booking_matrix_kreta_MD/Kreta-Jason Hotel Apartments.md';
  const outputJsonPath = join(tempDir, 'Kreta-Jason Hotel Apartments.json');

  await mkdir(tempDir, { recursive: true });

  try {
    await converter.markdownFileToJsonFile(inputMarkdownPath, outputJsonPath);

    const jsonText = await readText(outputJsonPath);
    const page = PropertyPageJsonCodec.deserialize(jsonText);

    expect(page.captureQuality).toBe('blocked');
    expect(page.issues).toContain('Blocked or CAPTCHA page');
    expect(page.review.score).toBeNull();
    expect(page.review.count).toBe(0);
    expect(page.imageUrls).toEqual([]);
    expect(page.description).toContain('Brak danych z powodu błędu lub CAPTCHA');
    expect(Object.values(page.enrichments)).toEqual(['', '', '', '', '', '', '', '']);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
