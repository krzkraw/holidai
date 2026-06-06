import {
  ScrapedPropertyPage,
  type ScrapedPropertyPageAmenities,
  type ScrapedPropertyPageCaptureQuality,
  type ScrapedPropertyPageCoordinates,
  type ScrapedPropertyPageEnrichments,
  type ScrapedPropertyPagePolicy,
  type ScrapedPropertyPageReviewComment,
  type ScrapedPropertyPageReviewSummary,
  type ScrapedPropertyPageRoomTable,
  type ScrapedPropertyPageStayPrice,
} from '../domain/scraped-property-page';

export interface ScrapedPropertyPageJson {
  readonly title: string;
  readonly country: string;
  readonly propertyName: string;
  readonly address: string;
  readonly coordinates: ScrapedPropertyPageCoordinates | null;
  readonly imageUrls: readonly string[];
  readonly description: string;
  readonly stayPrices: readonly ScrapedPropertyPageStayPrice[];
  readonly roomTable: ScrapedPropertyPageRoomTable;
  readonly review: ScrapedPropertyPageReviewSummary;
  readonly comments: readonly ScrapedPropertyPageReviewComment[];
  readonly surroundingsRaw: string;
  readonly amenities: ScrapedPropertyPageAmenities;
  readonly policy: ScrapedPropertyPagePolicy;
  readonly authorSummaryBullets: readonly string[];
  readonly captureQuality: ScrapedPropertyPageCaptureQuality;
  readonly issues: readonly string[];
  readonly placeholders: readonly string[];
  readonly enrichments: ScrapedPropertyPageEnrichments;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Invalid or missing string field ${fieldName}`);
  }

  return value;
}

function requireNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Invalid or missing numeric field ${fieldName}`);
  }

  return value;
}

function requireBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`Invalid or missing boolean field ${fieldName}`);
  }

  return value;
}

function requireNullableCoordinates(value: unknown): ScrapedPropertyPageCoordinates | null {
  if (value === null) {
    return null;
  }

  if (!isRecord(value)) {
    throw new Error('Invalid coordinates field');
  }

  return {
    latitude: requireNumber(value.latitude, 'coordinates.latitude'),
    longitude: requireNumber(value.longitude, 'coordinates.longitude'),
  };
}

function requireStringArray(value: unknown, fieldName: string): readonly string[] {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
    throw new Error(`Invalid or missing string array field ${fieldName}`);
  }

  return Object.freeze([...value]);
}

function requireCaptureQuality(value: unknown): ScrapedPropertyPageCaptureQuality {
  if (value !== 'complete' && value !== 'partial' && value !== 'blocked') {
    throw new Error('Invalid or missing captureQuality field');
  }

  return value;
}

function requireStayPrices(value: unknown): readonly ScrapedPropertyPageStayPrice[] {
  if (!Array.isArray(value)) {
    throw new Error('Invalid or missing stayPrices field');
  }

  return Object.freeze(
    value.map((entry, index) => {
      if (!isRecord(entry)) {
        throw new Error(`Invalid stayPrices entry at index ${index}`);
      }

      return Object.freeze({
        nights: entry.nights === null ? null : requireNumber(entry.nights, `stayPrices[${index}].nights`),
        dateRange: requireString(entry.dateRange, `stayPrices[${index}].dateRange`),
        pricePln: entry.pricePln === null ? null : requireNumber(entry.pricePln, `stayPrices[${index}].pricePln`),
        raw: requireString(entry.raw, `stayPrices[${index}].raw`),
      });
    }),
  );
}

function requireRoomTable(value: unknown): ScrapedPropertyPageRoomTable {
  if (!isRecord(value)) {
    throw new Error('Invalid or missing roomTable field');
  }

  const rows = Array.isArray(value.rows)
    ? value.rows.map((row, index) => {
        if (!Array.isArray(row) || row.some((cell) => typeof cell !== 'string')) {
          throw new Error(`Invalid roomTable.rows entry at index ${index}`);
        }

        return Object.freeze([...row]);
      })
    : null;

  if (rows === null) {
    throw new Error('Invalid or missing roomTable.rows field');
  }

  return Object.freeze({
    columns: requireStringArray(value.columns, 'roomTable.columns'),
    rows: Object.freeze(rows),
    raw: requireString(value.raw, 'roomTable.raw'),
  });
}

function requireReview(value: unknown): ScrapedPropertyPageReviewSummary {
  if (!isRecord(value)) {
    throw new Error('Invalid or missing review field');
  }

  return Object.freeze({
    score: value.score === null ? null : requireNumber(value.score, 'review.score'),
    count: requireNumber(value.count, 'review.count'),
  });
}

function requireComments(value: unknown): readonly ScrapedPropertyPageReviewComment[] {
  if (!Array.isArray(value)) {
    throw new Error('Invalid or missing comments field');
  }

  return Object.freeze(
    value.map((entry, index) => {
      if (!isRecord(entry)) {
        throw new Error(`Invalid comments entry at index ${index}`);
      }

      return Object.freeze({
        author: requireString(entry.author, `comments[${index}].author`),
        text: requireString(entry.text, `comments[${index}].text`),
      });
    }),
  );
}

function requireAmenities(value: unknown): ScrapedPropertyPageAmenities {
  if (!isRecord(value) || !isRecord(value.laundry)) {
    throw new Error('Invalid or missing amenities field');
  }

  return Object.freeze({
    flatList: requireStringArray(value.flatList, 'amenities.flatList'),
    laundry: Object.freeze({
      confirmed: requireBoolean(value.laundry.confirmed, 'amenities.laundry.confirmed'),
      onlyInReviews: requireBoolean(value.laundry.onlyInReviews, 'amenities.laundry.onlyInReviews'),
      service: requireBoolean(value.laundry.service, 'amenities.laundry.service'),
      evidence: requireStringArray(value.laundry.evidence, 'amenities.laundry.evidence'),
    }),
  });
}

function requirePolicy(value: unknown): ScrapedPropertyPagePolicy {
  if (!isRecord(value)) {
    throw new Error('Invalid or missing policy field');
  }

  return Object.freeze({
    houseRulesRaw: requireString(value.houseRulesRaw, 'policy.houseRulesRaw'),
    importantInfoRaw: requireString(value.importantInfoRaw, 'policy.importantInfoRaw'),
  });
}

function requireEnrichments(value: unknown): ScrapedPropertyPageEnrichments {
  if (!isRecord(value)) {
    throw new Error('Invalid or missing enrichments field');
  }

  return {
    'Overall Impression': requireString(value['Overall Impression'], 'enrichments.Overall Impression'),
    'Location & Beach': requireString(value['Location & Beach'], 'enrichments.Location & Beach'),
    'Room Fit': requireString(value['Room Fit'], 'enrichments.Room Fit'),
    'Amenities & Comfort': requireString(value['Amenities & Comfort'], 'enrichments.Amenities & Comfort'),
    'Laundry Verdict': requireString(value['Laundry Verdict'], 'enrichments.Laundry Verdict'),
    'Guest Sentiment': requireString(value['Guest Sentiment'], 'enrichments.Guest Sentiment'),
    'Tradeoffs': requireString(value['Tradeoffs'], 'enrichments.Tradeoffs'),
    'Best For': requireString(value['Best For'], 'enrichments.Best For'),
  };
}

export class PropertyPageJsonCodec {
  static serialize(page: ScrapedPropertyPage): string {
    const json: ScrapedPropertyPageJson = {
      title: page.title,
      country: page.country,
      propertyName: page.propertyName,
      address: page.address,
      coordinates: page.coordinates,
      imageUrls: page.imageUrls,
      description: page.description,
      stayPrices: page.stayPrices,
      roomTable: page.roomTable,
      review: page.review,
      comments: page.comments,
      surroundingsRaw: page.surroundingsRaw,
      amenities: page.amenities,
      policy: page.policy,
      authorSummaryBullets: page.authorSummaryBullets,
      captureQuality: page.captureQuality,
      issues: page.issues,
      placeholders: page.placeholders,
      enrichments: page.enrichments,
    };

    return `${JSON.stringify(json, null, 2)}\n`;
  }

  static deserialize(jsonText: string): ScrapedPropertyPage {
    const parsed = JSON.parse(jsonText);
    if (!isRecord(parsed)) {
      throw new Error('Property page JSON must decode to an object');
    }

    return new ScrapedPropertyPage(
      requireString(parsed.title, 'title'),
      requireString(parsed.country, 'country'),
      requireString(parsed.propertyName, 'propertyName'),
      requireString(parsed.address, 'address'),
      requireNullableCoordinates(parsed.coordinates),
      requireStringArray(parsed.imageUrls, 'imageUrls'),
      requireString(parsed.description, 'description'),
      requireStayPrices(parsed.stayPrices),
      requireRoomTable(parsed.roomTable),
      requireReview(parsed.review),
      requireComments(parsed.comments),
      requireString(parsed.surroundingsRaw, 'surroundingsRaw'),
      requireAmenities(parsed.amenities),
      requirePolicy(parsed.policy),
      requireStringArray(parsed.authorSummaryBullets, 'authorSummaryBullets'),
      requireCaptureQuality(parsed.captureQuality),
      requireStringArray(parsed.issues, 'issues'),
      requireStringArray(parsed.placeholders, 'placeholders'),
      requireEnrichments(parsed.enrichments),
    );
  }
}
