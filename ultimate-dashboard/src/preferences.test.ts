import { describe, expect, it } from 'vitest';

import {
  DASHBOARD_PREFERENCES_STORAGE_KEY,
  readDashboardPreferences,
  writeDashboardPreferences,
} from './preferences';

class MemoryStorage implements Pick<Storage, 'getItem' | 'setItem'> {
  private values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe('dashboard preferences persistence', () => {
  it('returns empty preferences when storage is missing or malformed', () => {
    const storage = new MemoryStorage();

    expect(readDashboardPreferences(storage)).toEqual({
      favorites: {},
      flightFavorites: {},
      lengths: {},
      selectedBookings: {},
      selectedFlights: {},
      variants: {},
    });

    storage.setItem(DASHBOARD_PREFERENCES_STORAGE_KEY, '{bad json');

    expect(readDashboardPreferences(storage)).toEqual({
      favorites: {},
      flightFavorites: {},
      lengths: {},
      selectedBookings: {},
      selectedFlights: {},
      variants: {},
    });
  });

  it('round-trips favorites and toolbar choices through local storage shape', () => {
    const storage = new MemoryStorage();
    const preferences = {
      favorites: { Albania: ['https://example.com/a'] },
      flightFavorites: { Albania: ['main:KRK-TIA'] },
      lengths: { Albania: '8' },
      selectedBookings: { Albania: 'https://example.com/a' },
      selectedFlights: { Albania: 'main:KRK-TIA' },
      variants: { Albania: 'A — super: plaża / ocena / okolica' },
    };

    expect(writeDashboardPreferences(preferences, storage)).toBe(true);
    expect(readDashboardPreferences(storage)).toEqual(preferences);
  });

  it('drops invalid destination buckets instead of trusting arbitrary storage data', () => {
    const storage = new MemoryStorage();
    storage.setItem(
      DASHBOARD_PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        favorites: { Albania: ['ok'], Mars: ['bad'], Cypr: [12] },
        flightFavorites: { Cypr: ['flight-ok'], Mars: ['bad'], Albania: [12] },
        lengths: { Albania: '14', Mars: '8', Cypr: 11 },
        selectedBookings: { Kreta: 'hotel-ok', Mars: 'bad', Cypr: 12 },
        selectedFlights: { Turcja: 'flight-ok', Mars: 'bad', Albania: 12 },
        variants: { Turcja: 'D — charakter: natura / klify / baza wypadowa', Mars: 'A' },
      }),
    );

    expect(readDashboardPreferences(storage)).toEqual({
      favorites: { Albania: ['ok'] },
      flightFavorites: { Cypr: ['flight-ok'] },
      lengths: { Albania: '14' },
      selectedBookings: { Kreta: 'hotel-ok' },
      selectedFlights: { Turcja: 'flight-ok' },
      variants: { Turcja: 'D — charakter: natura / klify / baza wypadowa' },
    });
  });
});
