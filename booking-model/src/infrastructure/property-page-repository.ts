import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, isAbsolute, join, posix } from 'node:path';

import type { ScrapedPropertyPage } from '../domain/scraped-property-page';
import { PropertyPageJsonCodec } from './property-page-json-codec';

function defaultPagesRootPath(): string {
  return join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'pages');
}

function normalizePageContentPath(pageContent: string): string {
  const normalized = pageContent.replace(/\\/g, '/').trim();

  if (normalized === '') {
    throw new Error('Booking page content path cannot be empty');
  }

  if (isAbsolute(normalized)) {
    throw new Error(`Booking page content path must be relative: ${pageContent}`);
  }

  if (!normalized.startsWith('scrape/')) {
    throw new Error(`Booking page content path must start with scrape/: ${pageContent}`);
  }

  if (!normalized.toLowerCase().endsWith('.md')) {
    throw new Error(`Booking page content path must end with .md: ${pageContent}`);
  }

  const relativeJsonPath = posix.normalize(`${normalized.slice('scrape/'.length, -'.md'.length)}.json`);
  if (relativeJsonPath === '' || relativeJsonPath.startsWith('..') || posix.isAbsolute(relativeJsonPath)) {
    throw new Error(`Booking page content path escapes the pages root: ${pageContent}`);
  }

  return relativeJsonPath;
}

export class PropertyPageRepository {
  constructor(private readonly pagesRootPath: string = defaultPagesRootPath()) {}

  resolveJsonPath(pageContent: string): string {
    return join(this.pagesRootPath, normalizePageContentPath(pageContent));
  }

  loadByPageContent(pageContent: string): ScrapedPropertyPage {
    const jsonPath = this.resolveJsonPath(pageContent);

    let jsonText: string;
    try {
      jsonText = readFileSync(jsonPath, 'utf8');
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to read Booking page JSON for ${pageContent} at ${jsonPath}: ${reason}`);
    }

    try {
      return PropertyPageJsonCodec.deserialize(jsonText);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to parse Booking page JSON for ${pageContent} at ${jsonPath}: ${reason}`);
    }
  }
}
