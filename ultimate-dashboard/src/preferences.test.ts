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

    expect(readDashboardPreferences(storage)).toEqual({ favorites: {}, lengths: {}, variants: {} });

    storage.setItem(DASHBOARD_PREFERENCES_STORAGE_KEY, '{bad json');

    expect(readDashboardPreferences(storage)).toEqual({ favorites: {}, lengths: {}, variants: {} });
  });

  it('round-trips favorites and toolbar choices through local storage shape', () => {
    const storage = new MemoryStorage();
    const preferences = {
      favorites: { Albania: ['https://example.com/a'] },
      lengths: { Albania: '8' },
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
        lengths: { Albania: '14', Mars: '8', Cypr: 11 },
        variants: { Turcja: 'D — charakter: natura / klify / baza wypadowa', Mars: 'A' },
      }),
    );

    expect(readDashboardPreferences(storage)).toEqual({
      favorites: { Albania: ['ok'] },
      lengths: { Albania: '14' },
      variants: { Turcja: 'D — charakter: natura / klify / baza wypadowa' },
    });
  });
});
