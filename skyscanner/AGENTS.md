# AGENTS.md

Operating contract for autonomous agents working in `~/Dev/holidai/skyscanner`.

## Scope

This folder contains the Skyscanner flight matrix model and CSV/TS conversion tooling.

## Key Files

- `src/domain/skyscanner-matrix.ts`
- `src/infrastructure/csv-codec.ts`
- `src/infrastructure/ts-module-codec.ts`
- `src/application/skyscanner-matrix-converter.ts`
- `src/cli.ts`
- `test/roundtrip.test.ts`

## Verification

```bash
bun test skyscanner/test/roundtrip.test.ts
bun run skyscanner/src/cli.ts roundtrip research/skyscanner_matrix_albania_grecja_cypr.csv
bun run skyscanner/src/cli.ts roundtrip research/skyscanner_matrix_turcja_kreta.csv
```

## Notes

- Preserve the original CSV byte layout. Do not normalize CRLF/LF or strip trailing newlines.
- Keep Skyscanner tooling separate from `booking-model`.
