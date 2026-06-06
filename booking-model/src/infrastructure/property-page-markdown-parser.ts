import {
  ScrapedPropertyPage,
  type ScrapedPropertyPageAmenities,
  type ScrapedPropertyPageCaptureQuality,
  type ScrapedPropertyPageCoordinates,
  type ScrapedPropertyPagePolicy,
  type ScrapedPropertyPageReviewComment,
  type ScrapedPropertyPageRoomTable,
  type ScrapedPropertyPageStayPrice,
} from '../domain/scraped-property-page';

function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, '\n');
}

function trimTrailingBlankLines(text: string): string {
  return text.replace(/\n+$/u, '');
}

function isHeading(line: string): boolean {
  return /^##\s+/.test(line);
}

function splitSections(markdownText: string): Map<string, string[]> {
  const lines = normalizeNewlines(markdownText).split('\n');
  const sections = new Map<string, string[]>();
  let current = '__preamble__';
  sections.set(current, []);

  for (const line of lines) {
    if (isHeading(line)) {
      current = line.trim();
      sections.set(current, []);
      continue;
    }

    sections.get(current)?.push(line);
  }

  return sections;
}

function findSection(sections: Map<string, string[]>, prefix: string): string[] {
  for (const [heading, lines] of sections) {
    if (heading.startsWith(prefix)) {
      return lines;
    }
  }

  return [];
}

function extractTitle(markdownText: string): string {
  const firstLine = normalizeNewlines(markdownText).split('\n', 1)[0] ?? '';
  return firstLine.startsWith('# ') ? firstLine.slice(2).trim() : firstLine.trim();
}

function splitCountryAndPropertyName(title: string): { country: string; propertyName: string } {
  const separator = ' - ';
  const separatorIndex = title.indexOf(separator);
  if (separatorIndex < 0) {
    return { country: '', propertyName: title };
  }

  return {
    country: title.slice(0, separatorIndex).trim(),
    propertyName: title.slice(separatorIndex + separator.length).trim(),
  };
}

function labelValue(lines: readonly string[], label: string): string {
  const prefix = `- **${label}:**`;
  for (const line of lines) {
    const trimmedLine = line.trimStart();
    if (trimmedLine.startsWith(prefix)) {
      return trimmedLine.slice(prefix.length).trim();
    }
  }

  return '';
}

function collectBlockAfterLabel(lines: readonly string[], label: string): string {
  const prefix = `- **${label}:**`;
  const startIndex = lines.findIndex((line) => line.trimStart().startsWith(prefix));
  if (startIndex < 0) {
    return '';
  }

  const collected: string[] = [];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmedLine = line.trimStart();
    if (trimmedLine.startsWith('- **') || isHeading(trimmedLine)) {
      break;
    }

    collected.push(line);
  }

  return trimTrailingBlankLines(collected.join('\n')).trim();
}

function extractUrls(block: string): readonly string[] {
  return [...block.matchAll(/https?:\/\/\S+/g)].map(([match]) => match);
}

function parseCoordinates(raw: string): ScrapedPropertyPageCoordinates | null {
  const [left, right] = raw.split(',').map((part) => part.trim());
  if (!left || !right) {
    return null;
  }

  const latitude = Number(left);
  const longitude = Number(right);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
}

function parseStayPrices(lines: readonly string[]): readonly ScrapedPropertyPageStayPrice[] {
  const prices: ScrapedPropertyPageStayPrice[] = [];

  for (const line of lines) {
    const match = line.trimStart().match(/^- \*\*(.+?):\*\*\s*(.+)$/);
    if (!match) {
      continue;
    }

    const label = match[1];
    const rawPrice = match[2].trim();
    const nightsMatch = label.match(/^(\d+)\s+dni(?:\s+\(([^)]+)\))?/u);
    const nights = nightsMatch ? Number(nightsMatch[1]) : null;
    const dateRange = nightsMatch?.[2] ?? '';
    const priceMatch = rawPrice.match(/(\d[\d\s]*)\s*PLN/u);
    const pricePln = priceMatch ? Number(priceMatch[1].replace(/\s+/g, '')) : null;

    prices.push({
      nights,
      dateRange,
      pricePln,
      raw: rawPrice,
    });
  }

  return prices;
}

function parseRoomTable(block: string): ScrapedPropertyPageRoomTable {
  const lines = block.split('\n').map((line) => line.trimEnd());
  const tableLines = lines.filter((line) => line.startsWith('|'));

  if (tableLines.length < 2) {
    return {
      columns: [],
      rows: [],
      raw: block.trim(),
    };
  }

  const columns = tableLines[0]
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim());

  const rows = tableLines.slice(2).map((line) =>
    line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim()),
  );

  return {
    columns,
    rows,
    raw: tableLines.join('\n'),
  };
}

function parseReviewSummary(lines: readonly string[]): { score: number | null; count: number } {
  const rawScore = labelValue(lines, 'Ocena ogólna');
  const scoreMatch = rawScore.match(/(\d+(?:[.,]\d+)?)/u);
  const score = rawScore.toLowerCase().includes('none') ? null : scoreMatch ? Number(scoreMatch[1].replace(',', '.')) : null;

  const rawCount = labelValue(lines, 'Liczba opinii');
  const countMatch = rawCount.match(/(\d+)/u);
  const count = countMatch ? Number(countMatch[1]) : 0;

  return { score, count };
}

function parseComments(lines: readonly string[]): readonly ScrapedPropertyPageReviewComment[] {
  const comments: ScrapedPropertyPageReviewComment[] = [];
  const startIndex = lines.findIndex((line) => line.startsWith('- **Lista komentarzy:**'));
  if (startIndex < 0) {
    return comments;
  }

  let currentAuthor = '';
  let currentText: string[] = [];

  const flush = (): void => {
    if (currentAuthor === '' && currentText.length === 0) {
      return;
    }

    comments.push({
      author: currentAuthor,
      text: currentText.join('\n').trim(),
    });
    currentAuthor = '';
    currentText = [];
  };

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmedLine = line.trimStart();
    if (trimmedLine.startsWith('## ')) {
      break;
    }

    const authorMatch = trimmedLine.match(/^\*\*(.*?)\*\*:\s*$/);
    if (authorMatch) {
      flush();
      currentAuthor = authorMatch[1] ?? '';
      continue;
    }

    if (trimmedLine.startsWith('>')) {
      currentText.push(trimmedLine.replace(/^>\s?/, ''));
      continue;
    }

    if (trimmedLine === '') {
      continue;
    }
  }

  flush();
  return comments;
}

function parseAmenities(lines: readonly string[]): ScrapedPropertyPageAmenities {
  const verificationLine = labelValue(lines, 'Weryfikacja pralki');
  const allAmenitiesBlock = collectBlockAfterLabel(lines, 'Wszystkie udogodnienia');
  const flatList = [...allAmenitiesBlock.split(/[\n,]/u)]
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
  const evidence = verificationLine ? [verificationLine] : [];
  const lower = verificationLine.toLowerCase();
  const confirmed = /tak|dostępna|dostępna w pokoju|pralka dostępna/u.test(lower) && !/brak/u.test(lower);
  const onlyInReviews = /tylko opini/u.test(lower);
  const service = /usług/i.test(verificationLine) || /pranie/u.test(lower);

  return {
    flatList,
    laundry: {
      confirmed,
      onlyInReviews,
      service,
      evidence,
    },
  };
}

function parsePolicy(lines: readonly string[]): ScrapedPropertyPagePolicy {
  const houseRulesRaw = collectCodeFenceAfterLabel(lines, 'Zasady pobytu (House Rules)');
  const importantInfoRaw = collectCodeFenceAfterLabel(lines, 'Ważne Informacje (Important Info)');

  return {
    houseRulesRaw,
    importantInfoRaw,
  };
}

function collectCodeFenceAfterLabel(lines: readonly string[], label: string): string {
  const prefix = `- **${label}:**`;
  const startIndex = lines.findIndex((line) => line.startsWith(prefix));
  if (startIndex < 0) {
    return '';
  }

  let fenceOpenIndex = -1;
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    if (lines[index].trim() === '```') {
      fenceOpenIndex = index;
      break;
    }
  }

  if (fenceOpenIndex < 0) {
    return '';
  }

  const collected: string[] = [];
  for (let index = fenceOpenIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() === '```') {
      break;
    }

    collected.push(line);
  }

  return trimTrailingBlankLines(collected.join('\n')).trim();
}

function parseSummaryBullets(lines: readonly string[]): readonly string[] {
  const bullets: string[] = [];
  for (const line of lines) {
    if (line.trimStart().startsWith('- ')) {
      bullets.push(line.trimStart().slice(2).trim());
    }
  }

  return bullets;
}

function collectPlaceholders(rawSections: readonly string[]): string[] {
  const placeholders = new Set<string>();

  for (const block of rawSections) {
    for (const line of block.split('\n')) {
      const trimmed = line.trim();
      if (
        trimmed.startsWith('Brak ') ||
        trimmed.startsWith('Brak.') ||
        trimmed.startsWith('TBD') ||
        trimmed.startsWith('None / 10')
      ) {
        placeholders.add(trimmed);
      }
    }
  }

  return [...placeholders];
}

function determineCaptureQuality(args: {
  readonly blocked: boolean;
  readonly issues: readonly string[];
}): ScrapedPropertyPageCaptureQuality {
  if (args.blocked) {
    return 'blocked';
  }

  return args.issues.length > 0 ? 'partial' : 'complete';
}

function detectIssues(args: {
  readonly sectionA: string[];
  readonly sectionB: string[];
  readonly sectionC: string[];
  readonly sectionD: string[];
  readonly sectionE: string[];
  readonly sectionF: string[];
}): { blocked: boolean; issues: string[] } {
  const joined = [args.sectionA, args.sectionB, args.sectionC, args.sectionD, args.sectionE, args.sectionF]
    .flat()
    .join('\n')
    .toLowerCase();

  const issues: string[] = [];
  const blocked =
    joined.includes('captcha') ||
    joined.includes('błąd') ||
    joined.includes('blocked') ||
    joined.includes('brak danych z powodu błędu lub captcha');

  if (blocked) {
    issues.push('Blocked or CAPTCHA page');
    return { blocked, issues };
  }

  if (joined.includes('brak szczegółowych informacji o otoczeniu')) {
    issues.push('Missing surrounding details');
  }

  if (joined.includes('brak danych.') || joined.includes('brak danych')) {
    issues.push('Missing page data');
  }

  if (joined.includes('brak widocznych zdjęć z siatki')) {
    issues.push('Missing image grid');
  }

  return { blocked, issues };
}

export function parsePropertyPageMarkdown(markdownText: string): ScrapedPropertyPage {
  const normalized = normalizeNewlines(markdownText);
  const sections = splitSections(normalized);
  const title = extractTitle(normalized);
  const { country, propertyName } = splitCountryAndPropertyName(title);

  const sectionA = findSection(sections, '## A)');
  const sectionB = findSection(sections, '## B)');
  const sectionC = findSection(sections, '## C)');
  const sectionD = findSection(sections, '## D)');
  const sectionE = findSection(sections, '## E)');
  const sectionF = findSection(sections, '## F)');
  const sectionSummary = findSection(sections, '## Podsumowanie i ocena autorska:');

  const address = labelValue(sectionA, 'Adres');
  const coordinates = parseCoordinates(labelValue(sectionA, 'Współrzędne'));
  const imageUrls = extractUrls(collectBlockAfterLabel(sectionA, 'Widoczne zdjęcia'));
  const description = collectBlockAfterLabel(sectionA, 'Opis obiektu');

  const stayPrices = parseStayPrices(sectionB);
  const roomTable = parseRoomTable(collectBlockAfterLabel(sectionB, 'Dokładna tabela pokoi'));
  const review = parseReviewSummary(sectionC);
  const comments = parseComments(sectionC);
  const surroundingsRaw = trimTrailingBlankLines(sectionD.join('\n')).trim();
  const amenities = parseAmenities(sectionE);
  const policy = parsePolicy(sectionF);
  const authorSummaryBullets = parseSummaryBullets(sectionSummary);

  const { blocked, issues } = detectIssues({
    sectionA,
    sectionB,
    sectionC,
    sectionD,
    sectionE,
    sectionF,
  });
  const placeholders = collectPlaceholders([sectionA, sectionB, sectionC, sectionD, sectionE, sectionF, sectionSummary].map((lines) => lines.join('\n')));
  const captureQuality = determineCaptureQuality({ blocked, issues });

  return new ScrapedPropertyPage(
    title,
    country,
    propertyName,
    address,
    coordinates,
    imageUrls,
    description,
    stayPrices,
    roomTable,
    review,
    comments,
    surroundingsRaw,
    amenities,
    policy,
    authorSummaryBullets,
    captureQuality,
    issues,
    placeholders,
  );
}
