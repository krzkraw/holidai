import type { DestinationKey } from '../model';

export const COMPRESSED_BOOKINGS_URL = './data/bookings/bookings.json.gz';
export const PLAIN_BOOKINGS_URL = './data/bookings/bookings.json';

export type BookingsDataFormat = 'gzip' | 'json';

export type StayJson = {
  days: number;
  checkIn: string;
  checkOut: string;
  price: number | null;
};

export type PriceRangeJson = {
  min: number;
  max: number;
};

export type StayPriceJson = {
  nights: number | null;
  dateRange: string;
  pricePln: number | null;
  raw: string;
};

export type RoomTableJson = {
  columns: readonly string[];
  rows: readonly (readonly string[])[];
  raw: string;
};

export type ReviewCommentJson = {
  author: string;
  text: string;
};

export type ScrapedPropertyPageJson = {
  title: string;
  country: string;
  propertyName: string;
  address: string;
  coordinates: { latitude: number; longitude: number } | null;
  imageUrls: readonly string[];
  description: string;
  stayPrices: readonly StayPriceJson[];
  roomTable: RoomTableJson;
  review: { score: number | null; count: number };
  comments: readonly ReviewCommentJson[];
  surroundingsRaw: string;
  amenities: {
    flatList: readonly string[];
    laundry: {
      confirmed: boolean;
      onlyInReviews: boolean;
      service: boolean;
      evidence: readonly string[];
    };
  };
  policy: {
    houseRulesRaw: string;
    importantInfoRaw: string;
  };
  authorSummaryBullets: readonly string[];
  captureQuality: string;
  issues: readonly string[];
  placeholders: readonly string[];
  enrichments: Readonly<Record<string, string>>;
};

export type BookingJson = {
  destination: DestinationKey;
  tier: string;
  name: string;
  rating: number | null;
  reviews: number;
  laundry: string;
  washingMachineConfirmed: boolean;
  washingMachineOnlyInReviews: boolean;
  laundryService: boolean;
  kitchen: boolean;
  privateBathroom: boolean;
  beachView: boolean;
  seaView: boolean;
  parking: boolean;
  beachInfo: string;
  evaluation: number;
  pageContent: string;
  details: ScrapedPropertyPageJson;
  url: string;
  stays: readonly StayJson[];
};

type JsonRecord = Record<string, unknown>;

export async function parseBookingsResponse(
  response: Response,
  format: BookingsDataFormat,
): Promise<readonly BookingJson[]> {
  if (!response.ok) {
    throw new Error(`Failed to load bookings data: ${response.status} ${response.statusText}`.trim());
  }

  let json: unknown;

  if (format === 'json') {
    json = await response.json();
    return validateBookingsData(json);
  }

  if (response.headers.get('content-encoding')?.toLowerCase().includes('gzip')) {
    json = await response.json();
    return validateBookingsData(json);
  }

  if (!response.body) {
    throw new Error('Bookings gzip response has no body');
  }

  if (typeof DecompressionStream === 'undefined') {
    throw new Error('Browser does not support gzip decompression streams');
  }

  const decompressedStream = response.body.pipeThrough(new DecompressionStream('gzip'));
  json = await new Response(decompressedStream).json();
  return validateBookingsData(json);
}

export async function loadBookingsData(): Promise<readonly BookingJson[]> {
  try {
    const compressedResponse = await fetch(COMPRESSED_BOOKINGS_URL);
    return await parseBookingsResponse(compressedResponse, 'gzip');
  } catch {
    const plainResponse = await fetch(PLAIN_BOOKINGS_URL);
    return parseBookingsResponse(plainResponse, 'json');
  }
}

export function validateBookingsData(value: unknown): readonly BookingJson[] {
  assert(Array.isArray(value), 'bookings: expected array');

  value.forEach((booking, index) => validateBooking(booking, `booking[${index}]`));

  return value as BookingJson[];
}

export function getBookingsForDestination(
  bookings: readonly BookingJson[],
  destination: DestinationKey,
  tier: string,
  selectedStayDays?: number | string,
): readonly BookingJson[] {
  const matching = bookings.filter((booking) => booking.destination === destination && booking.tier === tier);
  const targetDays = parseStayDays(selectedStayDays);

  return [...matching].sort((left, right) => {
    const evaluationDelta = right.evaluation - left.evaluation;

    if (evaluationDelta !== 0) {
      return evaluationDelta;
    }

    if (targetDays === null) {
      return 0;
    }

    return compareNullablePrice(getStayForDays(left, targetDays)?.price ?? null, getStayForDays(right, targetDays)?.price ?? null);
  });
}

export function getStayForDays(booking: BookingJson, days: number | string): StayJson | null {
  const targetDays = parseStayDays(days);

  if (targetDays === null) {
    return null;
  }

  return booking.stays.find((stay) => stay.days === targetDays) ?? null;
}

export function getPriceRangeForDestination(
  bookings: readonly BookingJson[],
  destination: DestinationKey,
  tier: string,
  days: number | string,
): PriceRangeJson | null {
  const targetDays = parseStayDays(days);

  if (targetDays === null) {
    return null;
  }

  let min: number | null = null;
  let max: number | null = null;

  for (const booking of bookings) {
    if (booking.destination !== destination || booking.tier !== tier) {
      continue;
    }

    const price = getStayForDays(booking, targetDays)?.price ?? null;

    if (price === null) {
      continue;
    }

    min = min === null ? price : Math.min(min, price);
    max = max === null ? price : Math.max(max, price);
  }

  if (min === null || max === null) {
    return null;
  }

  return { min, max };
}

export function formatStayPrice(stay: StayJson | null | undefined): string {
  if (!stay || stay.price === null) {
    return 'Cena TBD';
  }

  return `${formatPlnNumber(stay.price)} PLN`;
}

export function formatPriceRange(range: PriceRangeJson | null | undefined): string {
  if (!range) {
    return 'Cena TBD';
  }

  if (range.min === range.max) {
    return `${formatPlnNumber(range.min)} PLN`;
  }

  return `${formatPlnNumber(range.min)}-${formatPlnNumber(range.max)} PLN`;
}

export function renderRoomCellLines(rawCell: string): readonly string[] {
  return rawCell
    .split(/<br\s*\/?>/gi)
    .map((line) => line.replace(/<[^>]*>/g, '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function validateBooking(value: unknown, path: string): asserts value is BookingJson {
  const booking = requireRecord(value, path);

  requireString(booking, 'destination', path);
  requireString(booking, 'tier', path);
  requireString(booking, 'name', path);
  requireNullableNumber(booking, 'rating', path);
  requireNumber(booking, 'reviews', path);
  requireString(booking, 'laundry', path);
  requireBoolean(booking, 'washingMachineConfirmed', path);
  requireBoolean(booking, 'washingMachineOnlyInReviews', path);
  requireBoolean(booking, 'laundryService', path);
  requireBoolean(booking, 'kitchen', path);
  requireBoolean(booking, 'privateBathroom', path);
  requireBoolean(booking, 'beachView', path);
  requireBoolean(booking, 'seaView', path);
  requireBoolean(booking, 'parking', path);
  requireString(booking, 'beachInfo', path);
  requireNumber(booking, 'evaluation', path);
  requireString(booking, 'pageContent', path);
  requireString(booking, 'url', path);
  validateStays(booking.stays, `${path}.stays`);
  validateDetails(booking.details, `${path}.details`);
}

function validateStays(value: unknown, path: string): asserts value is readonly StayJson[] {
  assert(Array.isArray(value), `${path}: expected array`);

  value.forEach((stay, index) => {
    const item = requireRecord(stay, `${path}[${index}]`);

    requireNumber(item, 'days', `${path}[${index}]`);
    requireString(item, 'checkIn', `${path}[${index}]`);
    requireString(item, 'checkOut', `${path}[${index}]`);
    requireNullableNumber(item, 'price', `${path}[${index}]`);
  });
}

function validateDetails(value: unknown, path: string): asserts value is ScrapedPropertyPageJson {
  const details = requireRecord(value, path);

  requireString(details, 'title', path);
  requireString(details, 'country', path);
  requireString(details, 'propertyName', path);
  requireString(details, 'address', path);
  validateCoordinates(details.coordinates, `${path}.coordinates`);
  requireStringArray(details.imageUrls, `${path}.imageUrls`);
  requireString(details, 'description', path);
  validateStayPrices(details.stayPrices, `${path}.stayPrices`);
  validateRoomTable(details.roomTable, `${path}.roomTable`);
  validateReview(details.review, `${path}.review`);
  validateComments(details.comments, `${path}.comments`);
  requireString(details, 'surroundingsRaw', path);
  validateAmenities(details.amenities, `${path}.amenities`);
  validatePolicy(details.policy, `${path}.policy`);
  requireStringArray(details.authorSummaryBullets, `${path}.authorSummaryBullets`);
  requireString(details, 'captureQuality', path);
  requireStringArray(details.issues, `${path}.issues`);
  requireStringArray(details.placeholders, `${path}.placeholders`);
  validateStringRecord(details.enrichments, `${path}.enrichments`);
}

function validateCoordinates(value: unknown, path: string): void {
  if (value === null) {
    return;
  }

  const coordinates = requireRecord(value, path);
  requireNumber(coordinates, 'latitude', path);
  requireNumber(coordinates, 'longitude', path);
}

function validateStayPrices(value: unknown, path: string): void {
  assert(Array.isArray(value), `${path}: expected array`);

  value.forEach((stayPrice, index) => {
    const item = requireRecord(stayPrice, `${path}[${index}]`);

    requireNullableNumber(item, 'nights', `${path}[${index}]`);
    requireString(item, 'dateRange', `${path}[${index}]`);
    requireNullableNumber(item, 'pricePln', `${path}[${index}]`);
    requireString(item, 'raw', `${path}[${index}]`);
  });
}

function validateRoomTable(value: unknown, path: string): void {
  const roomTable = requireRecord(value, path);

  requireStringArray(roomTable.columns, `${path}.columns`);
  assert(Array.isArray(roomTable.rows), `${path}.rows: expected array`);
  roomTable.rows.forEach((row, index) => requireStringArray(row, `${path}.rows[${index}]`));
  requireString(roomTable, 'raw', path);
}

function validateReview(value: unknown, path: string): void {
  const review = requireRecord(value, path);

  requireNullableNumber(review, 'score', path);
  requireNumber(review, 'count', path);
}

function validateComments(value: unknown, path: string): void {
  assert(Array.isArray(value), `${path}: expected array`);

  value.forEach((comment, index) => {
    const item = requireRecord(comment, `${path}[${index}]`);

    requireString(item, 'author', `${path}[${index}]`);
    requireString(item, 'text', `${path}[${index}]`);
  });
}

function validateAmenities(value: unknown, path: string): void {
  const amenities = requireRecord(value, path);
  const laundry = requireRecord(amenities.laundry, `${path}.laundry`);

  requireStringArray(amenities.flatList, `${path}.flatList`);
  requireBoolean(laundry, 'confirmed', `${path}.laundry`);
  requireBoolean(laundry, 'onlyInReviews', `${path}.laundry`);
  requireBoolean(laundry, 'service', `${path}.laundry`);
  requireStringArray(laundry.evidence, `${path}.laundry.evidence`);
}

function validatePolicy(value: unknown, path: string): void {
  const policy = requireRecord(value, path);

  requireString(policy, 'houseRulesRaw', path);
  requireString(policy, 'importantInfoRaw', path);
}

function validateStringRecord(value: unknown, path: string): void {
  const record = requireRecord(value, path);

  for (const [key, item] of Object.entries(record)) {
    assert(typeof item === 'string', `${path}.${key}: expected string`);
  }
}

function requireRecord(value: unknown, path: string): JsonRecord {
  assert(isRecord(value), `${path}: expected object`);
  return value;
}

function requireString(record: JsonRecord, key: string, path: string): void {
  assert(typeof record[key] === 'string', `${path}.${key}: expected string`);
}

function requireNumber(record: JsonRecord, key: string, path: string): void {
  assert(typeof record[key] === 'number' && Number.isFinite(record[key]), `${path}.${key}: expected number`);
}

function requireNullableNumber(record: JsonRecord, key: string, path: string): void {
  assert(
    record[key] === null || (typeof record[key] === 'number' && Number.isFinite(record[key])),
    `${path}.${key}: expected number or null`,
  );
}

function requireBoolean(record: JsonRecord, key: string, path: string): void {
  assert(typeof record[key] === 'boolean', `${path}.${key}: expected boolean`);
}

function requireStringArray(value: unknown, path: string): void {
  assert(Array.isArray(value), `${path}: expected array`);
  value.forEach((item, index) => assert(typeof item === 'string', `${path}[${index}]: expected string`));
}

function compareNullablePrice(left: number | null, right: number | null): number {
  if (left === null && right === null) {
    return 0;
  }

  if (left === null) {
    return 1;
  }

  if (right === null) {
    return -1;
  }

  return left - right;
}

function parseStayDays(value: number | string | undefined): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function formatPlnNumber(value: number): string {
  return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Invalid bookings data: ${message}`);
  }
}
