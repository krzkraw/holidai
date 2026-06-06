export class StayDays {
  private constructor(public readonly value: number) {}

  static fromRaw(raw: string | undefined): StayDays | null {
    if (raw === undefined || raw.trim() === '') {
      return null;
    }

    if (!/^\d+$/.test(raw)) {
      throw new Error(`Invalid stay days value: ${raw}`);
    }

    const value = Number.parseInt(raw, 10);
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error(`Stay days must be a positive integer: ${raw}`);
    }

    return new StayDays(value);
  }
}

export class LexicalNumber {
  private constructor(public readonly raw: string) {}

  static fromRaw(raw: string | undefined, fieldName: string): LexicalNumber | null {
    if (raw === undefined || raw.trim() === '') {
      return null;
    }

    const normalized = raw.trim();
    if (!/^[-+]?\d+(?:\.\d+)?$/.test(normalized)) {
      throw new Error(`Invalid numeric value for ${fieldName}: ${raw}`);
    }

    return new LexicalNumber(raw);
  }

  toNumber(): number {
    return Number(this.raw);
  }
}

export class CsvBoolean {
  private constructor(
    public readonly raw: string,
    public readonly value: boolean,
  ) {}

  static fromRaw(raw: string | undefined, fieldName: string): CsvBoolean {
    if (raw === undefined || raw.trim() === '') {
      throw new Error(`Missing boolean value for ${fieldName}`);
    }

    if (raw === 'True') {
      return new CsvBoolean(raw, true);
    }

    if (raw === 'False') {
      return new CsvBoolean(raw, false);
    }

    throw new Error(`Invalid boolean token for ${fieldName}: ${raw}`);
  }
}

export function parseOptionalInteger(raw: string | undefined, fieldName: string): number | null {
  if (raw === undefined || raw.trim() === '') {
    return null;
  }

  if (!/^\d+$/.test(raw)) {
    throw new Error(`Invalid integer value for ${fieldName}: ${raw}`);
  }

  return Number.parseInt(raw, 10);
}
