export const ENRICHMENT_TITLES = [
  'Overall Impression',
  'Location & Beach',
  'Room Fit',
  'Amenities & Comfort',
  'Laundry Verdict',
  'Guest Sentiment',
  'Tradeoffs',
  'Best For',
] as const;

export type EnrichmentTitle = (typeof ENRICHMENT_TITLES)[number];

export type ScrapedPropertyPageCaptureQuality = 'complete' | 'partial' | 'blocked';

export interface ScrapedPropertyPageEnrichments extends Record<EnrichmentTitle, string> {}

export interface ScrapedPropertyPageCoordinates {
  readonly latitude: number;
  readonly longitude: number;
}

export interface ScrapedPropertyPageStayPrice {
  readonly nights: number | null;
  readonly dateRange: string;
  readonly pricePln: number | null;
  readonly raw: string;
}

export interface ScrapedPropertyPageRoomTable {
  readonly columns: readonly string[];
  readonly rows: readonly (readonly string[])[];
  readonly raw: string;
}

export interface ScrapedPropertyPageReviewComment {
  readonly author: string;
  readonly text: string;
}

export interface ScrapedPropertyPageReviewSummary {
  readonly score: number | null;
  readonly count: number;
}

export interface ScrapedPropertyPageAmenitiesLaundry {
  readonly confirmed: boolean;
  readonly onlyInReviews: boolean;
  readonly service: boolean;
  readonly evidence: readonly string[];
}

export interface ScrapedPropertyPageAmenities {
  readonly flatList: readonly string[];
  readonly laundry: ScrapedPropertyPageAmenitiesLaundry;
}

export interface ScrapedPropertyPagePolicy {
  readonly houseRulesRaw: string;
  readonly importantInfoRaw: string;
}

export interface ScrapedPropertyPageParseMetadata {
  readonly captureQuality: ScrapedPropertyPageCaptureQuality;
  readonly issues: readonly string[];
  readonly placeholders: readonly string[];
}

function freezeStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

function freezeRows(values: readonly (readonly string[])[]): readonly (readonly string[])[] {
  return Object.freeze(values.map((row) => Object.freeze([...row])));
}

export function createEmptyEnrichments(): ScrapedPropertyPageEnrichments {
  return {
    'Overall Impression': '',
    'Location & Beach': '',
    'Room Fit': '',
    'Amenities & Comfort': '',
    'Laundry Verdict': '',
    'Guest Sentiment': '',
    'Tradeoffs': '',
    'Best For': '',
  };
}

function normalizeEnrichments(
  enrichments: Partial<ScrapedPropertyPageEnrichments> | undefined,
): ScrapedPropertyPageEnrichments {
  return {
    'Overall Impression': enrichments?.['Overall Impression'] ?? '',
    'Location & Beach': enrichments?.['Location & Beach'] ?? '',
    'Room Fit': enrichments?.['Room Fit'] ?? '',
    'Amenities & Comfort': enrichments?.['Amenities & Comfort'] ?? '',
    'Laundry Verdict': enrichments?.['Laundry Verdict'] ?? '',
    'Guest Sentiment': enrichments?.['Guest Sentiment'] ?? '',
    'Tradeoffs': enrichments?.['Tradeoffs'] ?? '',
    'Best For': enrichments?.['Best For'] ?? '',
  };
}

export class ScrapedPropertyPage {
  public readonly enrichments: ScrapedPropertyPageEnrichments;

  constructor(
    public readonly title: string,
    public readonly country: string,
    public readonly propertyName: string,
    public readonly address: string,
    public readonly coordinates: ScrapedPropertyPageCoordinates | null,
    public readonly imageUrls: readonly string[],
    public readonly description: string,
    public readonly stayPrices: readonly ScrapedPropertyPageStayPrice[],
    public readonly roomTable: ScrapedPropertyPageRoomTable,
    public readonly review: ScrapedPropertyPageReviewSummary,
    public readonly comments: readonly ScrapedPropertyPageReviewComment[],
    public readonly surroundingsRaw: string,
    public readonly amenities: ScrapedPropertyPageAmenities,
    public readonly policy: ScrapedPropertyPagePolicy,
    public readonly authorSummaryBullets: readonly string[],
    public readonly captureQuality: ScrapedPropertyPageCaptureQuality,
    public readonly issues: readonly string[],
    public readonly placeholders: readonly string[],
    enrichments: Partial<ScrapedPropertyPageEnrichments> = {},
  ) {
    this.imageUrls = freezeStrings(imageUrls);
    this.stayPrices = Object.freeze(
      stayPrices.map((stayPrice) =>
        Object.freeze({
          nights: stayPrice.nights,
          dateRange: stayPrice.dateRange,
          pricePln: stayPrice.pricePln,
          raw: stayPrice.raw,
        }),
      ),
    );
    this.roomTable = Object.freeze({
      columns: freezeStrings(roomTable.columns),
      rows: freezeRows(roomTable.rows),
      raw: roomTable.raw,
    });
    this.review = Object.freeze({
      score: review.score,
      count: review.count,
    });
    this.comments = Object.freeze(
      comments.map((comment) =>
        Object.freeze({
          author: comment.author,
          text: comment.text,
        }),
      ),
    );
    this.amenities = Object.freeze({
      flatList: freezeStrings(amenities.flatList),
      laundry: Object.freeze({
        confirmed: amenities.laundry.confirmed,
        onlyInReviews: amenities.laundry.onlyInReviews,
        service: amenities.laundry.service,
        evidence: freezeStrings(amenities.laundry.evidence),
      }),
    });
    this.policy = Object.freeze({
      houseRulesRaw: policy.houseRulesRaw,
      importantInfoRaw: policy.importantInfoRaw,
    });
    this.authorSummaryBullets = freezeStrings(authorSummaryBullets);
    this.issues = freezeStrings(issues);
    this.placeholders = freezeStrings(placeholders);
    this.enrichments = Object.freeze(normalizeEnrichments(enrichments));
  }

  static createEmptyEnrichments(): ScrapedPropertyPageEnrichments {
    return createEmptyEnrichments();
  }
}
