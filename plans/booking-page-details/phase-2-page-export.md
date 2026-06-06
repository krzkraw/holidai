# Phase 2: JSON Export Pipeline

## Phase Goal

Implement conversion from markdown files to serialized JSON files in `booking-model/pages/`. This phase is executed by one bounded subagent and must end with converter tests passing and the output directory populated deterministically.

## Files To Inspect

- `AGENTS.md`
- `plans/booking-page-details/masterplan-booking-page-details.md`
- `plans/booking-page-details/phase-1-page-model.md`
- `booking-model/src/application/booking-model-converter.ts`
- `booking-model/src/cli.ts`

## Files Likely To Modify

- `booking-model/src/application/property-page-converter.ts`
- `booking-model/src/infrastructure/property-page-json-codec.ts`
- `booking-model/src/cli.ts`
- `booking-model/test/property-page-converter.test.ts`
- `booking-model/pages/`

## Exact Implementation Tasks

1. Add JSON codec helpers for serializing and deserializing `ScrapedPropertyPage`.
2. Add converter methods for:
   - one markdown file to one JSON file
   - one directory tree of markdown files to a JSON output tree
3. If needed, extend `booking-model/src/cli.ts` with narrow export commands for page JSON generation.
4. Generate JSON filenames by preserving the markdown stem and replacing `.md` with `.json`.
5. Serialize UTF-8 pretty JSON with all fixed enrichment keys initialized to empty strings.
6. Write converter tests for:
   - single-file export
   - directory export
   - blocked-page export
7. Run the export pipeline to populate `booking-model/pages/` from the current markdown source set.

## Acceptance Criteria

- `booking-model/pages/` exists and contains JSON files for the markdown dumps being exported.
- Every JSON contains deterministic fields and the full fixed enrichment bag with empty string values.
- Converter tests pass.

## Verification Commands

- `bun test booking-model/test/property-page-converter.test.ts`
- `bun test booking-model/test/property-page-parser.test.ts`

## Risks

- Output path mapping must stay stable because later booking integration depends on it.
- Generated JSON must be committed as intended project artifacts, not treated like transient build output.

## Status

- `done`
