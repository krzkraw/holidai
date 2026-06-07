import { expect, test } from 'bun:test';

import { parsePropertyPageMarkdown } from '../src';

async function readSample(path: string): Promise<string> {
  return Bun.file(path).text();
}

test('parses a complete Booking markdown dump conservatively', async () => {
  const page = parsePropertyPageMarkdown(await readSample('/Users/krz/Dev/holidai/scrape/GRECJA/booking_matrix_grecja_MD/Grecja-Calypso Studios.md'));

  expect(page.title).toBe('Grecja - Calypso Studios');
  expect(page.country).toBe('Grecja');
  expect(page.propertyName).toBe('Calypso Studios');
  expect(page.captureQuality).toBe('complete');
  expect(page.address).toBe('');
  expect(page.imageUrls.length).toBeGreaterThan(0);
  expect(page.description).toContain('Obiekt Calypso Studios');
  expect(page.stayPrices).toHaveLength(3);
  expect(page.stayPrices[0]).toMatchObject({ nights: 8, pricePln: 2440 });
  expect(page.roomTable.columns).toContain('Rodzaj zakwaterowania');
  expect(page.review.score).toBe(9.6);
  expect(page.review.count).toBe(292);
  expect(page.comments[0]).toMatchObject({ author: 'Zakrocki' });
  expect(page.surroundingsRaw).toContain('Oceniony jako wyjątkowy');
  expect(page.amenities.flatList).toContain('Bezpłatne Wi-Fi');
  expect(page.amenities.laundry.confirmed).toBe(false);
  expect(page.policy.houseRulesRaw).toContain('Zasady pobytu');
  expect(page.authorSummaryBullets[0]).toContain('Odległość od plaży');
  expect(Object.values(page.enrichments)).toEqual(['', '', '', '', '', '', '', '']);
});

test('parses a partial Booking markdown dump without overfitting missing sections', async () => {
  const page = parsePropertyPageMarkdown(await readSample('/Users/krz/Dev/holidai/scrape/GRECJA/booking_matrix_grecja_MD/Grecja-Panorama.md'));

  expect(page.propertyName).toBe('Panorama');
  expect(page.captureQuality).toBe('partial');
  expect(page.issues).toContain('Missing surrounding details');
  expect(page.review.score).toBe(9.1);
  expect(page.review.count).toBe(381);
  expect(page.surroundingsRaw).toContain('Brak szczegółowych informacji o otoczeniu');
  expect(page.amenities.laundry.confirmed).toBe(false);
});

test('parses a blocked Booking markdown dump as blocked capture metadata', async () => {
  const page = parsePropertyPageMarkdown(
    await readSample('/Users/krz/Dev/holidai/scrape/kreta/booking_matrix_kreta_MD/Kreta-Jason Hotel Apartments.md'),
  );

  expect(page.propertyName).toBe('Jason Hotel Apartments');
  expect(page.captureQuality).toBe('blocked');
  expect(page.issues).toContain('Blocked or CAPTCHA page');
  expect(page.review.score).toBeNull();
  expect(page.review.count).toBe(0);
  expect(page.description).toContain('Brak danych z powodu błędu lub CAPTCHA');
  expect(page.imageUrls).toEqual([]);
  expect(page.stayPrices).toHaveLength(3);
  expect(page.stayPrices.map((stayPrice) => stayPrice.pricePln)).toEqual([null, null, null]);
});
