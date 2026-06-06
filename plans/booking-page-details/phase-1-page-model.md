# Phase 1: Deterministic Page Model And Parser

## Phase Goal

Create the deterministic `ScrapedPropertyPage` model and markdown parser in `booking-model`. This phase is executed by one bounded subagent and must finish with passing parser-focused tests.

## Files To Inspect

- `AGENTS.md`
- `booking-model/src/domain/booking.ts`
- `booking-model/src/index.ts`
- `scrape/ALBANIA/booking_matrix_albania_MD/*.md`
- `scrape/GRECJA/booking_matrix_grecja_MD/*.md`

## Files Likely To Modify

- `booking-model/src/domain/scraped-property-page.ts`
- `booking-model/src/infrastructure/property-page-markdown-parser.ts`
- `booking-model/src/index.ts`
- `booking-model/test/property-page-parser.test.ts`

## Exact Implementation Tasks

1. Add `ScrapedPropertyPage` and all deterministic nested types beside `booking.ts`.
2. Define the fixed enrichment key union and `Record<EnrichmentTitle, string>` property bag on the page model.
3. Implement markdown section splitting for sections `A` through `F` plus final summary.
4. Parse reliable fields only:
   - title, country, property name
   - address, coordinates, image URLs, description
   - stay prices
   - room table columns and rows as raw strings
   - review score, review count, comments
   - surroundings raw text
   - amenities flat list and laundry booleans plus evidence
   - policy raw blocks
   - author summary bullets
   - capture quality, issues, placeholders
5. Export the new model and parser entrypoints from `booking-model/src/index.ts`.
6. Add parser tests using the sample Albania and Greece markdown files, including one blocked/CAPTCHA file.

## Acceptance Criteria

- The deterministic page model compiles and is exported.
- The parser can produce a page model for complete, partial, and blocked dumps.
- Fixed enrichment keys exist and are initialized by constructor/helper code, even before enrichment.
- Parser tests pass.

## Verification Commands

- `bun test booking-model/test/property-page-parser.test.ts`

## Risks

- Markdown variation may tempt over-parsing; the phase must stay within deterministic, reliable extraction only.
- Partial captures must not crash parsing.

## Status

- `planned`
