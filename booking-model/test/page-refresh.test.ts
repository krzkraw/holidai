import { expect, test } from 'bun:test';

import { parsePropertyPageMarkdown } from '../src';
import { PropertyPageJsonCodec } from '../src/infrastructure/property-page-json-codec';

async function readPage(path: string) {
  return PropertyPageJsonCodec.deserialize(await Bun.file(path).text());
}

async function assertMarkdownMatchesJson(markdownPath: string, jsonPath: string) {
  const markdownText = await Bun.file(markdownPath).text();
  const parsed = parsePropertyPageMarkdown(markdownText);
  const expectedJsonText = await Bun.file(jsonPath).text();
  const expectedJson = JSON.parse(expectedJsonText) as {
    enrichments: Record<string, string>;
  };

  expectedJson.enrichments = Object.fromEntries(Object.keys(expectedJson.enrichments).map((key) => [key, '']));

  expect(PropertyPageJsonCodec.serialize(parsed)).toBe(`${JSON.stringify(expectedJson, null, 2)}\n`);
}

test('Ideal ApartHotel Saranda page JSON is refreshed from the latest scraped markdown', async () => {
  const page = await readPage(
    '/Users/krz/Dev/holidai/booking-model/pages/ALBANIA/booking_matrix_albania_MD/Albania-Ideal ApartHotel Saranda.json',
  );

  expect(page.captureQuality).toBe('complete');
  expect(page.review.score).toBe(7.9);
  expect(page.review.count).toBe(602);
  expect(page.roomTable.rows).toHaveLength(3);
  expect(page.stayPrices.map((stay) => stay.pricePln)).toEqual([742, 1020, 1299]);
  expect(page.coordinates).toEqual({ latitude: 39.877412, longitude: 20.007737 });
  expect(page.imageUrls).toHaveLength(12);
  expect(page.enrichments['Overall Impression']).toContain('value-focused');
});

test('Panorama page JSON is refreshed from the latest scraped markdown', async () => {
  const page = await readPage('/Users/krz/Dev/holidai/booking-model/pages/GRECJA/booking_matrix_grecja_MD/Grecja-Panorama.json');

  expect(page.captureQuality).toBe('partial');
  expect(page.review.score).toBe(9.1);
  expect(page.review.count).toBe(381);
  expect(page.stayPrices.map((stay) => stay.pricePln)).toEqual([2146, 2935, 3682]);
  expect(page.roomTable.columns).toEqual(['Typ pokoju', 'Liczba gości', 'Cena za 2 tygodnie', 'Twoje opcje', 'Wybierz pokoje']);
  expect(page.coordinates).toEqual({ latitude: 37.7232776478913, longitude: 20.860770062149072 });
  expect(page.roomTable.rows).toHaveLength(1);
  expect(page.enrichments['Best For']).toContain('couples');
});

test('refreshed markdown sources stay aligned with the committed JSON files', async () => {
  await assertMarkdownMatchesJson(
    '/Users/krz/Dev/holidai/scrape/ALBANIA/booking_matrix_albania_MD/Albania-Ideal ApartHotel Saranda.md',
    '/Users/krz/Dev/holidai/booking-model/pages/ALBANIA/booking_matrix_albania_MD/Albania-Ideal ApartHotel Saranda.json',
  );

  await assertMarkdownMatchesJson(
    '/Users/krz/Dev/holidai/scrape/GRECJA/booking_matrix_grecja_MD/Grecja-Panorama.md',
    '/Users/krz/Dev/holidai/booking-model/pages/GRECJA/booking_matrix_grecja_MD/Grecja-Panorama.json',
  );
});
