# Booking Page Details Master Plan

## Scope

Add a deterministic Booking.com markdown page model to `booking-model`, export all page dumps as JSON with fixed empty enrichment fields, fill those enrichments sequentially via subagents, then attach the fully populated page model to `Booking` as `details`.

## Target Files

- `booking-model/src/domain/booking.ts`
- `booking-model/src/domain/scraped-property-page.ts`
- `booking-model/src/application/property-page-converter.ts`
- `booking-model/src/infrastructure/property-page-markdown-parser.ts`
- `booking-model/src/infrastructure/property-page-json-codec.ts`
- `booking-model/src/infrastructure/property-page-repository.ts`
- `booking-model/src/index.ts`
- `booking-model/src/cli.ts`
- `booking-model/test/property-page-parser.test.ts`
- `booking-model/test/property-page-converter.test.ts`
- `booking-model/test/booking.test.ts`
- `booking-model/test/roundtrip.test.ts`
- `booking-model/pages/`

## Issue Or Goal

The current `booking-model` can build `Booking` objects from CSV rows, but the markdown page dumps remain opaque paths. The goal is to convert those dumps into a deterministic display-ready model, enrich that model with fixed titled summaries, and make each `Booking` carry the full page details.

## Proposed Fix

- Add a new deterministic `ScrapedPropertyPage` model next to `booking.ts`.
- Implement markdown parsing and JSON serialization to `booking-model/pages/`.
- Use a fixed enrichment bag `Record<EnrichmentTitle, string>` inside each serialized JSON.
- Fill enrichments sequentially with one subagent per phase item during the enrichment phase.
- Load serialized page JSONs back into the booking pipeline and attach them as `Booking.details`.

## Verification Strategy

- Focused Bun tests for parser, converter, and booking integration.
- Spot-check generated JSONs for complete and blocked markdown dumps.
- Verify `bookingsFromMatrix(...)` returns bookings with populated `details`.

## Risks And Assumptions

- Markdown dumps are only partially structured, so v1 must preserve raw text for noisy sections.
- Enrichments must stay within the fixed schema to keep display output consistent.
- The existing `pageContent` path in CSV rows is assumed to map one-to-one to a generated page JSON.
- `booking-model/pages/` is assumed to be committed output, not ephemeral build output.

## Phase List

1. `phase-1-page-model.md` — deterministic domain model and parser
2. `phase-2-page-export.md` — JSON export pipeline and test coverage
3. `phase-3-page-enrichment.md` — sequential subagent enrichment of serialized JSONs
4. `phase-4-booking-integration.md` — attach page details to `Booking`

## Status

- `phase-1-page-model.md`: done
- `phase-2-page-export.md`: done
- `phase-3-page-enrichment.md`: pending
- `phase-4-booking-integration.md`: pending
