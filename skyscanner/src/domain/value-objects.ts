export class TravelDays {
  private constructor(public readonly value: number) {}

  static fromRaw(raw: string | undefined): TravelDays | null {
    if (raw === undefined || raw.trim() === '') {
      return null;
    }

    if (!/^\d+$/.test(raw)) {
      throw new Error(`Invalid travel days value: ${raw}`);
    }

    const value = Number.parseInt(raw, 10);
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error(`Travel days must be a positive integer: ${raw}`);
    }

    return new TravelDays(value);
  }
}

export class IsoDate {
  private constructor(public readonly value: string) {}

  static fromRaw(raw: string | undefined, fieldName: string): IsoDate {
    if (raw === undefined || raw.trim() === '') {
      throw new Error(`Missing ISO date for ${fieldName}`);
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      throw new Error(`Invalid ISO date for ${fieldName}: ${raw}`);
    }

    const parsed = new Date(`${raw}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error(`Invalid ISO date for ${fieldName}: ${raw}`);
    }

    const normalized = parsed.toISOString().slice(0, 10);
    if (normalized !== raw) {
      throw new Error(`Invalid ISO date for ${fieldName}: ${raw}`);
    }

    return new IsoDate(raw);
  }
}

export function optionalText(raw: string | undefined): string | null {
  if (raw === undefined || raw.trim() === '') {
    return null;
  }

  return raw;
}

export function requiredText(raw: string | undefined, fieldName: string): string {
  if (raw === undefined || raw.trim() === '') {
    throw new Error(`Missing value for ${fieldName}`);
  }

  return raw;
}
