import { expect, test } from 'bun:test';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { PropertyPageRepository } from '../src';

test('PropertyPageRepository maps scrape markdown paths to committed page JSON files', () => {
  const repository = new PropertyPageRepository();

  expect(
    repository.resolveJsonPath(
      'scrape/ALBANIA/booking_matrix_albania_MD/Albania-The White Donkey Apartment House.md',
    ),
  ).toBe(
    join(
      '/Users/krz/Dev/holidai/booking-model/pages',
      'ALBANIA/booking_matrix_albania_MD/Albania-The White Donkey Apartment House.json',
    ),
  );
});

test('PropertyPageRepository loads a real committed page JSON', () => {
  const repository = new PropertyPageRepository();
  const page = repository.loadByPageContent(
    'scrape/ALBANIA/booking_matrix_albania_MD/Albania-Ideal ApartHotel Saranda.md',
  );

  expect(page.propertyName).toBe('Ideal ApartHotel Saranda');
  expect(page.captureQuality).toBe('complete');
  expect(page.review.count).toBe(602);
  expect(page.enrichments['Overall Impression']).toContain('value-focused');
});

test('PropertyPageRepository wraps missing JSON files with a clear error', () => {
  const repository = new PropertyPageRepository('/tmp/booking-model-missing-pages');

  expect(() =>
    repository.loadByPageContent('scrape/ALBANIA/booking_matrix_albania_MD/Definitely-Missing.md'),
  ).toThrow(
    /Failed to read Booking page JSON for scrape\/ALBANIA\/booking_matrix_albania_MD\/Definitely-Missing\.md/,
  );
});

test('PropertyPageRepository wraps malformed JSON files with a clear error', async () => {
  const tempDir = join('/tmp', `booking-model-${crypto.randomUUID()}`);
  const repository = new PropertyPageRepository(tempDir);
  const jsonPath = join(tempDir, 'ALBANIA/booking_matrix_albania_MD/Corrupt.json');

  await mkdir(join(tempDir, 'ALBANIA/booking_matrix_albania_MD'), { recursive: true });
  await writeFile(jsonPath, '{not valid json', 'utf8');

  try {
    expect(() => repository.loadByPageContent('scrape/ALBANIA/booking_matrix_albania_MD/Corrupt.md')).toThrow(
      /Failed to parse Booking page JSON for scrape\/ALBANIA\/booking_matrix_albania_MD\/Corrupt\.md/,
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
