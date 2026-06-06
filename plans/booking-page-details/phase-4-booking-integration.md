# Phase 4: Attach Page Details To Booking

## Phase Goal

Make the booking pipeline attach the fully populated `ScrapedPropertyPage` model to each `Booking` as `details`. This phase is executed by one bounded subagent and must end with passing booking integration tests.

## Files To Inspect

- `AGENTS.md`
- `plans/booking-page-details/masterplan-booking-page-details.md`
- `plans/booking-page-details/phase-3-page-enrichment.md`
- `booking-model/src/domain/booking.ts`
- `booking-model/src/domain/booking-matrix.ts`
- `booking-model/src/application/booking-model-converter.ts`
- `booking-model/src/index.ts`
- `booking-model/pages/**/*.json`

## Files Likely To Modify

- `booking-model/src/domain/booking.ts`
- `booking-model/src/infrastructure/property-page-repository.ts`
- `booking-model/src/index.ts`
- `booking-model/test/booking.test.ts`
- `booking-model/test/roundtrip.test.ts`

## Exact Implementation Tasks

1. Add `details: ScrapedPropertyPage` to `Booking`.
2. Decide whether `pageContent` remains transitional metadata or is removed in favor of `details.sourcePath`; prefer removing it if no longer needed by callers.
3. Add a repository/helper that maps CSV `pageContent` markdown paths to generated JSON files under `booking-model/pages/`.
4. Update booking construction so grouped matrix rows load one page JSON and attach it to the resulting booking.
5. Add clear errors for missing or malformed page JSON files.
6. Extend booking tests to assert:
   - `details` exists
   - `details.propertyName` aligns with booking name
   - `details.enrichments` is present and populated
   - blocked pages still attach with blocked capture metadata

## Acceptance Criteria

- `Booking` carries full page details.
- The booking pipeline can load details from serialized page JSONs.
- Booking integration tests pass.

## Verification Commands

- `bun test booking-model/test/booking.test.ts`
- `bun test booking-model/test/roundtrip.test.ts`
- `bun test booking-model/test/property-page-parser.test.ts`
- `bun test booking-model/test/property-page-converter.test.ts`

## Risks

- Path mapping between CSV `pageContent` and `booking-model/pages/` JSONs must be exact.
- If `pageContent` is removed too early, callers may break; verify current usage before deleting it.

## Status

- `planned`
