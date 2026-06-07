import type { FavoriteBookingsByDestination, FavoriteFlightsByDestination } from './favorites';
import type { DestinationKey } from './model';

export const DASHBOARD_PREFERENCES_STORAGE_KEY = 'ultimate-dashboard.booking-preferences.v1';

export type DashboardPreferences = {
  favorites: FavoriteBookingsByDestination;
  flightFavorites: FavoriteFlightsByDestination;
  lengths: Partial<Record<DestinationKey, string>>;
  selectedBookings: Partial<Record<DestinationKey, string>>;
  selectedFlights: Partial<Record<DestinationKey, string>>;
  variants: Partial<Record<DestinationKey, string>>;
};

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;
type JsonRecord = Record<string, unknown>;

const DESTINATIONS: readonly DestinationKey[] = ['Albania', 'Grecja', 'Cypr', 'Turcja', 'Kreta'];
const EMPTY_PREFERENCES: DashboardPreferences = {
  favorites: {},
  flightFavorites: {},
  lengths: {},
  selectedBookings: {},
  selectedFlights: {},
  variants: {},
};

export function readDashboardPreferences(storage: StorageLike | null = getBrowserStorage()): DashboardPreferences {
  if (!storage) {
    return EMPTY_PREFERENCES;
  }

  try {
    const rawValue = storage.getItem(DASHBOARD_PREFERENCES_STORAGE_KEY);
    if (!rawValue) {
      return EMPTY_PREFERENCES;
    }

    const parsed = JSON.parse(rawValue);
    if (!isRecord(parsed)) {
      return EMPTY_PREFERENCES;
    }

    return {
      favorites: readFavorites(parsed.favorites),
      flightFavorites: readFavorites(parsed.flightFavorites),
      lengths: readStringBuckets(parsed.lengths),
      selectedBookings: readStringBuckets(parsed.selectedBookings),
      selectedFlights: readStringBuckets(parsed.selectedFlights),
      variants: readStringBuckets(parsed.variants),
    };
  } catch {
    return EMPTY_PREFERENCES;
  }
}

export function writeDashboardPreferences(
  preferences: DashboardPreferences,
  storage: StorageLike | null = getBrowserStorage(),
): boolean {
  if (!storage) {
    return false;
  }

  try {
    storage.setItem(
      DASHBOARD_PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        favorites: preferences.favorites,
        flightFavorites: preferences.flightFavorites,
        lengths: preferences.lengths,
        selectedBookings: preferences.selectedBookings,
        selectedFlights: preferences.selectedFlights,
        variants: preferences.variants,
      }),
    );
    return true;
  } catch {
    return false;
  }
}

function getBrowserStorage(): StorageLike | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readFavorites(value: unknown): FavoriteBookingsByDestination {
  if (!isRecord(value)) {
    return {};
  }

  const result: FavoriteBookingsByDestination = {};
  for (const destination of DESTINATIONS) {
    const item = value[destination];
    if (Array.isArray(item) && item.every((entry) => typeof entry === 'string')) {
      result[destination] = item;
    }
  }

  return result;
}

function readStringBuckets(value: unknown): Partial<Record<DestinationKey, string>> {
  if (!isRecord(value)) {
    return {};
  }

  const result: Partial<Record<DestinationKey, string>> = {};
  for (const destination of DESTINATIONS) {
    const item = value[destination];
    if (typeof item === 'string') {
      result[destination] = item;
    }
  }

  return result;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
