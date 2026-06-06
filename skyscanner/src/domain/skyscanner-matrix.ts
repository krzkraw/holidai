import { CsvCodec } from '../infrastructure/csv-codec';
import { TsModuleCodec } from '../infrastructure/ts-module-codec';
import { IsoDate, TravelDays, optionalText, requiredText } from './value-objects';

export interface CsvSnapshot {
  readonly hasBom: boolean;
  readonly lineEnding: '\n' | '\r\n';
  readonly trailingNewline: boolean;
  readonly header: readonly string[];
  readonly rows: readonly string[][];
}

const REQUIRED_COLUMNS = [
  'kraj/kierunek',
  'dni',
  'cena_zweryfikowana',
  'cena_z_wyszukiwania',
  'wylot',
  'powrot',
  'trasa tam',
  'trasa powrot',
  'przesiadki',
  'linie',
  'uwagi',
  'URL',
] as const;

function freezeSnapshot(snapshot: CsvSnapshot): CsvSnapshot {
  return Object.freeze({
    hasBom: snapshot.hasBom,
    lineEnding: snapshot.lineEnding,
    trailingNewline: snapshot.trailingNewline,
    header: Object.freeze([...snapshot.header]),
    rows: Object.freeze(snapshot.rows.map((row) => Object.freeze([...row]))),
  });
}

function validateSnapshot(snapshot: CsvSnapshot): void {
  if (snapshot.header.length === 0) {
    throw new Error('Skyscanner matrix header cannot be empty');
  }

  if (new Set(snapshot.header).size !== snapshot.header.length) {
    throw new Error(`Skyscanner matrix header contains duplicate columns: ${snapshot.header.join(', ')}`);
  }

  const header = new Set(snapshot.header);
  for (const column of REQUIRED_COLUMNS) {
    if (!header.has(column)) {
      throw new Error(`Skyscanner matrix is missing required column: ${column}`);
    }
  }
}

export class SkyscannerMatrixRow {
  constructor(
    private readonly header: readonly string[],
    private readonly cells: readonly string[],
  ) {}

  private indexOf(fieldName: string): number {
    const index = this.header.indexOf(fieldName);
    if (index < 0) {
      throw new Error(`Unknown Skyscanner matrix column: ${fieldName}`);
    }

    return index;
  }

  private cell(fieldName: string): string {
    return this.cells[this.indexOf(fieldName)] ?? '';
  }

  get routeLabel(): string {
    return requiredText(this.cell('kraj/kierunek'), 'kraj/kierunek');
  }

  get travelDays(): TravelDays | null {
    return TravelDays.fromRaw(this.cell('dni'));
  }

  get verifiedPriceText(): string | null {
    return optionalText(this.cell('cena_zweryfikowana'));
  }

  get searchPriceText(): string | null {
    return optionalText(this.cell('cena_z_wyszukiwania'));
  }

  get departureDate(): IsoDate {
    return IsoDate.fromRaw(this.cell('wylot'), 'wylot');
  }

  get returnDate(): IsoDate {
    return IsoDate.fromRaw(this.cell('powrot'), 'powrot');
  }

  get outboundRoute(): string {
    return requiredText(this.cell('trasa tam'), 'trasa tam');
  }

  get returnRoute(): string {
    return requiredText(this.cell('trasa powrot'), 'trasa powrot');
  }

  get stopsText(): string | null {
    return optionalText(this.cell('przesiadki'));
  }

  get airlinesText(): string | null {
    return optionalText(this.cell('linie'));
  }

  get notes(): string {
    return requiredText(this.cell('uwagi'), 'uwagi');
  }

  get url(): string {
    return requiredText(this.cell('URL'), 'URL');
  }

  toCells(): readonly string[] {
    return Object.freeze([...this.cells]);
  }
}

export class SkyscannerMatrix {
  private readonly rowsCache: readonly SkyscannerMatrixRow[];

  private constructor(private readonly snapshot: CsvSnapshot) {
    validateSnapshot(snapshot);
    this.rowsCache = Object.freeze(snapshot.rows.map((row) => new SkyscannerMatrixRow(snapshot.header, row)));
  }

  static fromSnapshot(snapshot: CsvSnapshot): SkyscannerMatrix {
    return new SkyscannerMatrix(freezeSnapshot(snapshot));
  }

  static fromCsvText(csvText: string): SkyscannerMatrix {
    return SkyscannerMatrix.fromSnapshot(CsvCodec.parse(csvText));
  }

  get header(): readonly string[] {
    return this.snapshot.header;
  }

  get hasBom(): boolean {
    return this.snapshot.hasBom;
  }

  get lineEnding(): '\n' | '\r\n' {
    return this.snapshot.lineEnding;
  }

  get trailingNewline(): boolean {
    return this.snapshot.trailingNewline;
  }

  get rows(): readonly SkyscannerMatrixRow[] {
    return this.rowsCache;
  }

  toSnapshot(): CsvSnapshot {
    return this.snapshot;
  }

  toCsvText(): string {
    return CsvCodec.serialize(this.snapshot);
  }

  toTsModuleSource(exportName = 'skyscannerMatrix'): string {
    return TsModuleCodec.render(this.snapshot, exportName);
  }

  routeCounts(): ReadonlyMap<string, number> {
    const counts = new Map<string, number>();
    for (const row of this.rows) {
      counts.set(row.routeLabel, (counts.get(row.routeLabel) ?? 0) + 1);
    }

    return counts;
  }

  rowsForRoute(routeLabel: string): readonly SkyscannerMatrixRow[] {
    return this.rows.filter((row) => row.routeLabel === routeLabel);
  }
}
