# Skyscanner Matrix Tools

This folder contains a dedicated TypeScript model and CSV roundtrip tooling for the Skyscanner flight matrices in `research/`.

## Inputs

- `research/skyscanner_matrix_albania_grecja_cypr.csv`
- `research/skyscanner_matrix_turcja_kreta.csv`

## Commands

Run the roundtrip checks:

```bash
bun test skyscanner/test/roundtrip.test.ts
bun run skyscanner/src/cli.ts roundtrip research/skyscanner_matrix_albania_grecja_cypr.csv
bun run skyscanner/src/cli.ts roundtrip research/skyscanner_matrix_turcja_kreta.csv
```

Convert CSV to a TS snapshot:

```bash
bun run skyscanner/src/cli.ts csv-to-ts research/skyscanner_matrix_albania_grecja_cypr.csv /tmp/skyscanner-matrix.ts
```

Convert a TS snapshot back to CSV:

```bash
bun run skyscanner/src/cli.ts ts-to-csv /tmp/skyscanner-matrix.ts /tmp/skyscanner-matrix.csv
```

## Model Notes

- The matrix preserves the original CSV bytes, including line endings and the trailing newline.
- The domain layer validates required columns, ISO dates, and positive day counts.
- Optional text fields remain raw so the converter can roundtrip exactly.
