import type { CsvSnapshot } from '../domain/booking-matrix';

function detectLineEnding(text: string): '\n' | '\r\n' {
  return text.includes('\r\n') ? '\r\n' : '\n';
}

function escapeCell(cell: string): string {
  const needsQuotes = cell.includes(',') || cell.includes('"') || cell.includes('\r') || cell.includes('\n');
  if (!needsQuotes) {
    return cell;
  }

  return `"${cell.replaceAll('"', '""')}"`;
}

function freezeSnapshot(snapshot: CsvSnapshot): CsvSnapshot {
  return Object.freeze({
    hasBom: snapshot.hasBom,
    lineEnding: snapshot.lineEnding,
    header: Object.freeze([...snapshot.header]),
    rows: Object.freeze(snapshot.rows.map((row) => Object.freeze([...row]))),
  });
}

export class CsvCodec {
  static parse(text: string): CsvSnapshot {
    if (text.length === 0) {
      throw new Error('CSV document is empty');
    }

    const hasBom = text.startsWith('\ufeff');
    const content = hasBom ? text.slice(1) : text;
    const lineEnding = detectLineEnding(content);

    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let inQuotes = false;

    for (let index = 0; index < content.length; index += 1) {
      const char = content[index];

      if (inQuotes) {
        if (char === '"') {
          if (content[index + 1] === '"') {
            currentCell += '"';
            index += 1;
            continue;
          }

          inQuotes = false;
          continue;
        }

        currentCell += char;
        continue;
      }

      if (char === '"') {
        inQuotes = true;
        continue;
      }

      if (char === ',') {
        currentRow.push(currentCell);
        currentCell = '';
        continue;
      }

      if (char === '\r' || char === '\n') {
        currentRow.push(currentCell);
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';

        if (char === '\r' && content[index + 1] === '\n') {
          index += 1;
        }

        continue;
      }

      currentCell += char;
    }

    if (inQuotes) {
      throw new Error('CSV contains an unterminated quoted field');
    }

    if (currentCell !== '' || currentRow.length > 0) {
      currentRow.push(currentCell);
      rows.push(currentRow);
    }

    if (rows.length === 0) {
      throw new Error('CSV document is missing a header row');
    }

    const header = rows[0];
    const bodyRows = rows.slice(1);

    if (new Set(header).size !== header.length) {
      throw new Error(`CSV header contains duplicate column names: ${header.join(', ')}`);
    }

    bodyRows.forEach((row, rowIndex) => {
      if (row.length !== header.length) {
        throw new Error(
          `Row ${rowIndex + 2} has ${row.length} cells but the header has ${header.length} columns`,
        );
      }
    });

    return freezeSnapshot({
      hasBom,
      lineEnding,
      header,
      rows: bodyRows,
    });
  }

  static serialize(snapshot: CsvSnapshot): string {
    const lines = [
      snapshot.header.map(escapeCell).join(','),
      ...snapshot.rows.map((row) => snapshot.header.map((_, index) => escapeCell(row[index] ?? '')).join(',')),
    ];

    const text = `${lines.join(snapshot.lineEnding)}${snapshot.lineEnding}`;
    return snapshot.hasBom ? `\ufeff${text}` : text;
  }
}
