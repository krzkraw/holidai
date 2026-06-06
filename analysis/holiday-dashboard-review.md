# Holiday Dashboard Review Handoff

What this file is: compact handoff for the 2026 holiday dashboard artifact audit.

Scope: review how the GPT and Gemini holiday dashboards were created, check data preservation from `gpt/sources/` to GPT final HTML, and track information degradation from GPT to Gemini v1/v2.

Date: 2026-06-06.

## Handoff Regeneration Prompt

You are continuing an artifact audit in `/Users/krz/Dev/holidai`. Read `AGENTS.md`, `gpt/AGENTS.md`, `gpt/README.md`, `gpt/sources/ultimate_booking_matrix.csv`, `gpt/ultimate-desktop.html`, `gpt/ultimate-mobile.html`, `gemini/2026-holidai-v1.html`, and `gemini/2026-holidai-v2.html`. Verify whether GPT final outputs preserve the CSV and source Markdown accommodation data; then verify what Gemini v1/v2 dropped, retained, or invented. Preserve the existing review files `gpt/review.md` and `gemini/review.md`; update them only with new verified evidence. Do not use `rtk` if exact text evidence is required.

## Sources Inspected

- Root `README.md` and `AGENTS.md`
- `gpt/README.md`
- `gpt/AGENTS.md`
- `gpt/sources/albania.md`
- `gpt/sources/grecja.md`
- `gpt/sources/cypr.md`
- `gpt/sources/booking_pralka_matrix.csv`
- `gpt/sources/ultimate_booking_matrix.csv`
- `gpt/ultimate-desktop.html`
- `gpt/ultimate-mobile.html`
- `gemini/2026-holidai-v1.html`
- `gemini/2026-holidai-v2.html`
- `booking-scraper-flow/README.md`
- `booking-scraper-flow/SKILL.md`
- `booking-scraper-flow/scripts/scrape_booking.py`
- `booking-scraper-flow/scripts/consolidate.py`

## Findings

- GPT final desktop renders 90/90 CSV accommodation rows with no material mismatches in key fields.
- GPT final mobile contains all 90 property names, all 90 Booking links, and all 90 Booking beach strings.
- GPT final HTML is not lossless versus raw Markdown; guest reviews, FAQ, subscores, full address strings, full room inventory, and full raw area/rule detail remain in `sources/*.md`.
- GPT final has contradictory washer notes for Franklin Premium Apart-Hotel, EMILIA 10 STUDIO, and NoMa Seafront Living.
- Source/GPT beach text contains malformed `The nearest beach is 0.` values for ten matrix rows.
- Gemini v1 and v2 drop all 90 verified GPT Booking rows, all original property names, and all original Booking URLs.
- Gemini v2 doubles original GPT flight constants for Albania, Zakynthos, and Cyprus while labeling them as two-person flight costs.

## Decisions And Recommendations

- Treat GPT final HTML as a useful dashboard, but keep `gpt/sources/*.md` and `ultimate_booking_matrix.csv` as source of truth.
- Treat Gemini HTMLs as research/UI prototypes until every hotel row has a source URL and verified washer status.
- Add validation before any future regeneration: count 90 rows/links for GPT destinations, reject contradictory washer prose, and reject `The nearest beach is 0.`.

## Risks And Unknowns

- No live travel, Booking.com, airline, or car-rental prices were checked during this audit.
- Turkey and Crete claims in Gemini were not externally verified.
- The current final dashboards rely on LLM-generated HTML rather than a reproducible generator.

## Next Actions

1. Fix GPT note contradictions and malformed beach distances.
2. Add a validation script for CSV-to-HTML preservation checks.
3. Rebuild Gemini accommodation data from verified source rows, or clearly mark Gemini hotel rows as placeholders.
