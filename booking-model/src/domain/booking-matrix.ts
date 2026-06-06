import { CsvCodec } from '../infrastructure/csv-codec';
import { TsModuleCodec } from '../infrastructure/ts-module-codec';
import { CsvBoolean, LexicalNumber, StayDays, parseOptionalInteger } from './value-objects';

export interface CsvSnapshot {
  readonly hasBom: boolean;
  readonly lineEnding: '\n' | '\r\n';
  readonly header: readonly string[];
  readonly rows: readonly string[][];
}

const REQUIRED_COLUMNS = [
  'kraj',
  'wariant',
  'nazwa',
  'cena_pln',
  'ocena_booking',
  'opinie_booking',
  'status_prania',
  'pralka_potwierdzona',
  'pralka_tylko_opinia',
  'usluga_prania',
  'kuchnia',
  'prywatna_lazienka',
  'beachfront',
  'sea_view',
  'parking',
  'plaza_booking',
  'ocena_wyboru_1_10',
  'link',
] as const;

function freezeSnapshot(snapshot: CsvSnapshot): CsvSnapshot {
  return Object.freeze({
    hasBom: snapshot.hasBom,
    lineEnding: snapshot.lineEnding,
    header: Object.freeze([...snapshot.header]),
    rows: Object.freeze(snapshot.rows.map((row) => Object.freeze([...row]))),
  });
}

function validateSnapshot(snapshot: CsvSnapshot): void {
  if (snapshot.header.length === 0) {
    throw new Error('Booking matrix header cannot be empty');
  }

  if (new Set(snapshot.header).size !== snapshot.header.length) {
    throw new Error(`Booking matrix header contains duplicate columns: ${snapshot.header.join(', ')}`);
  }

  const header = new Set(snapshot.header);
  for (const column of REQUIRED_COLUMNS) {
    if (!header.has(column)) {
      throw new Error(`Booking matrix is missing required column: ${column}`);
    }
  }
}

export class BookingMatrixRow {
  constructor(
    private readonly header: readonly string[],
    private readonly cells: readonly string[],
  ) {}

  private indexOf(fieldName: string): number {
    const index = this.header.indexOf(fieldName);
    if (index < 0) {
      throw new Error(`Unknown booking matrix column: ${fieldName}`);
    }

    return index;
  }

  private cell(fieldName: string): string {
    return this.cells[this.indexOf(fieldName)] ?? '';
  }

  private requiredCell(fieldName: string): string {
    const value = this.cell(fieldName);
    if (value === '') {
      throw new Error(`Missing value for required field ${fieldName}`);
    }

    return value;
  }

  get country(): string {
    return this.requiredCell('kraj');
  }

  get stayDays(): StayDays | null {
    return StayDays.fromRaw(this.cell('dni'));
  }

  get variant(): string {
    return this.requiredCell('wariant');
  }

  get propertyName(): string {
    return this.requiredCell('nazwa');
  }

  get pricePln(): LexicalNumber | null {
    return LexicalNumber.fromRaw(this.cell('cena_pln'), 'cena_pln');
  }

  get bookingScore(): LexicalNumber | null {
    return LexicalNumber.fromRaw(this.cell('ocena_booking'), 'ocena_booking');
  }

  get reviewCount(): number | null {
    return parseOptionalInteger(this.cell('opinie_booking'), 'opinie_booking');
  }

  get statusPrania(): string {
    return this.requiredCell('status_prania');
  }

  get washerConfirmed(): CsvBoolean {
    return CsvBoolean.fromRaw(this.cell('pralka_potwierdzona'), 'pralka_potwierdzona');
  }

  get washerOnlyInReview(): CsvBoolean {
    return CsvBoolean.fromRaw(this.cell('pralka_tylko_opinia'), 'pralka_tylko_opinia');
  }

  get laundryService(): CsvBoolean {
    return CsvBoolean.fromRaw(this.cell('usluga_prania'), 'usluga_prania');
  }

  get kitchen(): CsvBoolean {
    return CsvBoolean.fromRaw(this.cell('kuchnia'), 'kuchnia');
  }

  get privateBathroom(): CsvBoolean {
    return CsvBoolean.fromRaw(this.cell('prywatna_lazienka'), 'prywatna_lazienka');
  }

  get beachfront(): CsvBoolean {
    return CsvBoolean.fromRaw(this.cell('beachfront'), 'beachfront');
  }

  get seaView(): CsvBoolean {
    return CsvBoolean.fromRaw(this.cell('sea_view'), 'sea_view');
  }

  get parking(): CsvBoolean {
    return CsvBoolean.fromRaw(this.cell('parking'), 'parking');
  }

  get beachInfo(): string {
    return this.requiredCell('plaza_booking');
  }

  get selectionScore(): LexicalNumber | null {
    return LexicalNumber.fromRaw(this.cell('ocena_wyboru_1_10'), 'ocena_wyboru_1_10');
  }

  get bookingUrl(): string {
    return this.requiredCell('link');
  }

  toCells(): readonly string[] {
    return Object.freeze([...this.cells]);
  }
}

export class BookingMatrix {
  private readonly rowsCache: readonly BookingMatrixRow[];

  private constructor(private readonly snapshot: CsvSnapshot) {
    validateSnapshot(snapshot);
    this.rowsCache = Object.freeze(snapshot.rows.map((row) => new BookingMatrixRow(snapshot.header, row)));
  }

  static fromSnapshot(snapshot: CsvSnapshot): BookingMatrix {
    return new BookingMatrix(freezeSnapshot(snapshot));
  }

  static fromCsvText(csvText: string): BookingMatrix {
    return BookingMatrix.fromSnapshot(CsvCodec.parse(csvText));
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

  get rows(): readonly BookingMatrixRow[] {
    return this.rowsCache;
  }

  toSnapshot(): CsvSnapshot {
    return this.snapshot;
  }

  toCsvText(): string {
    return CsvCodec.serialize(this.snapshot);
  }

  confirmedWasherRows(): readonly BookingMatrixRow[] {
    return this.rows.filter((row) => row.washerConfirmed.value);
  }

  rowsForCountry(country: string): readonly BookingMatrixRow[] {
    return this.rows.filter((row) => row.country === country);
  }

  countryCounts(): ReadonlyMap<string, number> {
    const counts = new Map<string, number>();
    for (const row of this.rows) {
      counts.set(row.country, (counts.get(row.country) ?? 0) + 1);
    }

    return counts;
  }

  toTsModuleSource(exportName = 'bookingMatrix'): string {
    return TsModuleCodec.render(this.snapshot, exportName);
  }
}
