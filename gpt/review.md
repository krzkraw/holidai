# GPT Holiday Dashboard Review

What this is: audit of the GPT-produced holiday dashboards against the raw Booking.com Markdown source cards and CSV matrices.

Scope: `gpt/sources/`, `gpt/ultimate-desktop.html`, `gpt/ultimate-mobile.html`, and the local scraper flow in `booking-scraper-flow/`.

Date: 2026-06-06.

## Process Reconstructed

1. Initial holiday requirements were iterated with GPT into early HTML comparison reports.
2. `booking-scraper-flow/scripts/scrape_booking.py` extracted Booking.com property pages through `agent-browser` into individual Markdown cards.
3. `booking-scraper-flow/scripts/consolidate.py` grouped scraped cards by Booking URL country code into `albania.md`, `grecja.md`, and `cypr.md`.
4. GPT used those country Markdown files plus `booking_pralka_matrix.csv` / `ultimate_booking_matrix.csv` to enrich the earlier trip report.
5. Final GPT outputs are `ultimate-desktop.html` and `ultimate-mobile.html`; they are narrative dashboards, while raw lossless Booking data remains in `sources/*.md` and the accommodation matrix remains in `sources/ultimate_booking_matrix.csv`.

## Sources Inspected

- `gpt/README.md`
- `gpt/AGENTS.md`
- `gpt/sources/albania.md`
- `gpt/sources/grecja.md`
- `gpt/sources/cypr.md`
- `gpt/sources/booking_pralka_matrix.csv`
- `gpt/sources/ultimate_booking_matrix.csv`
- `gpt/ultimate-desktop.html`
- `gpt/ultimate-mobile.html`
- `booking-scraper-flow/README.md`
- `booking-scraper-flow/SKILL.md`
- `booking-scraper-flow/scripts/scrape_booking.py`
- `booking-scraper-flow/scripts/consolidate.py`

## Accommodation Integrity Checks

The accommodation matrix has 90 rows and 63 unique property names.

| Country | Matrix rows | Unique properties | Unique confirmed washer | Unique review-only washer | Unique laundry/service-only |
| --- | ---: | ---: | ---: | ---: | ---: |
| Albania | 30 | 23 | 11 | 0 | 1 |
| Grecja / Zakynthos | 30 | 19 | 1 | 0 | 0 |
| Cypr | 30 | 21 | 9 | 1 | 1 |

Checks performed against `ultimate_booking_matrix.csv`:

| Artifact | Result |
| --- | --- |
| `ultimate-desktop.html` table rows | 90 parsed rows; 0 material mismatches for property name, Booking link, price, Booking score, review count, washing status, kitchen/private-bathroom/beachfront flags, beach text, and selection score. |
| `ultimate-mobile.html` visible content | All 90 property names present, all 90 Booking links present, all 90 Booking beach strings present. |
| Desktop vs mobile headings | Same heading set except desktop has an extra `Tabela desktop: wszystkie oferty A/B/C` table view. The data is still present on mobile as cards. |

Verdict: the GPT final dashboards preserve the structured CSV accommodation rows well. The desktop table is a faithful rendering of the matrix, and the mobile version keeps the same essential property/card data.

## Information Degradation From Raw Markdown

The final HTML dashboards are not lossless copies of `albania.md`, `grecja.md`, and `cypr.md`. This is partly intentional: the dashboard itself says raw reviews, FAQ, rules, and full source cards are kept in Markdown so the HTML remains readable.

Information mostly summarized or omitted from the HTML:

| Raw source layer | Status in GPT HTML | Impact |
| --- | --- | --- |
| Full guest review excerpts | Dropped from property cards | Cannot audit qualitative issues or washer mentions from reviews directly in HTML. |
| FAQ sections | Dropped | Need source Markdown before booking. |
| Rating subscores such as cleanliness, comfort, facilities, location | Dropped | Useful ranking detail is unavailable in the dashboard. |
| Full address strings | Mostly dropped | Exact district/location requires source Markdown or Booking link. |
| Full room inventory | Summarized to chips | Exact room type must be rechecked before payment. |
| Full house rules | Partly retained as condensed chips | Important details may be truncated. |
| Full area-info lists | Condensed to selected chips | Nearby beach/restaurant/context detail is not complete. |

Action: keep the raw Markdown files and CSV bundled with any future handoff. Do not regenerate from `ultimate-*.html` alone.

## Concrete Flaws Found

### 1. Confirmed washer cards with contradictory notes

The structured badge/tag data says these are confirmed washer options, but the free-text note still says the washer is unconfirmed:

| Property | Structured status | Contradictory note |
| --- | --- | --- |
| Franklin Premium Apart-Hotel | `Pralka potwierdzona` | `pralka niepotwierdzona` |
| EMILIA 10 STUDIO | `Pralka potwierdzona` | `pralka niepotwierdzona` |
| NoMa Seafront Living | `Pralka potwierdzona` | `pralka niepotwierdzona` |

Action: regenerate or manually fix the note text from `status_prania`, not from older pre-audit prose.

### 2. Bad beach-distance source values were preserved

These rows contain `The nearest beach is 0.`:

| Country | Variant | Property |
| --- | --- | --- |
| Grecja | A | Agoulos Beach Hotel |
| Grecja | A | Nefeli Beach - living by the sea |
| Cypr | B | Santa Barbara Sea front resort and spa |
| Cypr | B | Mariela Hotel Apartments |
| Cypr | B | C & A Hotel Apartments |
| Cypr | B | Oasis Nature |
| Cypr | C | Mariela Hotel Apartments |
| Cypr | C | C & A Hotel Apartments |
| Cypr | C | Santa Barbara Sea front resort and spa |
| Cypr | C | Oasis Nature |

Action: fix the extraction/consolidation data or mark these as unknown. Do not present `0` as a beach distance.

### 3. Washer terminology is still easy to misread

Some prose says `pralnia` where the structured status is `Pralka potwierdzona`. The legend is correct, but card notes can blur the distinction between a washing machine in the unit, shared laundry, and paid laundry service.

Action: normalize every card note to one of the explicit statuses from `gpt/AGENTS.md`: confirmed washing machine, washing machine only in review, laundry service only, no washing data.

### 4. HTML is not backed by a reproducible generator

The data appears preserved in the final GPT HTML, but there is no checked-in generator that takes `ultimate_booking_matrix.csv` plus Markdown cards and emits the dashboards. Future LLM regeneration can silently drift.

Action: add a small validation/generation script or at minimum a validation script that fails when:

- the final HTML does not contain 90 matrix rows or all 90 Booking links,
- a confirmed washer card contains `pralka niepotwierdzona`,
- any beach string contains `The nearest beach is 0.`,
- any country summary count diverges from the CSV unique-property counts.

## Bottom Line

The GPT final outputs are good decision dashboards and preserve the structured accommodation matrix. They are not complete source archives. The main actionable fixes are contradictory washer notes, bad `0` beach-distance strings, and the lack of a reproducible validation/generation path.
