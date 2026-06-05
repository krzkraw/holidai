# AGENTS.md — Vacation Report Regeneration Guide

## Purpose

This repository/package contains a travel planning workflow for generating audited, human-readable vacation reports from mixed sources:

- narrative analysis and earlier HTML reports,
- structured accommodation matrices,
- raw accommodation pages exported to Markdown,
- destination-level assumptions about weather, water, nature, culture, logistics, and cost.

The current package focuses on a September 2026 trip for two people from Kraków, comparing:

1. Albania — Saranda / Ksamil / optional Himarë
2. Greece — Zakynthos
3. Cyprus — Paphos / Polis / Latchi / Akamas

The main deliverables are:

- `ultimate-desktop.html`
- `ultimate-mobile.html`

The goal for future agents is to **preserve the decision logic, enrich it with new data, and regenerate consistent desktop/mobile reports without losing context**.

---

## Directory layout

```text
.
├── ultimate-desktop.html
├── ultimate-mobile.html
├── README.md
├── AGENTS.md
└── sources/
    ├── albania.md
    ├── grecja.md
    ├── cypr.md
    ├── ultimate_booking_matrix.csv
    ├── booking_pralka_matrix.csv
    ├── raport_wakacje_wrzesien_2026_mobile.html
    ├── raport_wakacje_booking_pralka_v2_mobile.html
    ├── ultimate_raport_wakacje_2026_desktop.html
    ├── ultimate_raport_wakacje_2026_mobile.html
    ├── ultimate_raport_wakacje_2026_AUDITED_desktop.html
    └── ultimate_raport_wakacje_2026_AUDITED_mobile.html
```

Notes:

- Root-level `ultimate-desktop.html` and `ultimate-mobile.html` are the canonical final outputs.
- Everything in `sources/` should be treated as source material or previous build artifacts.
- Do not overwrite source files unless explicitly updating them with a newer export.

---

## Core assumptions

### Trip assumptions

- Travelers: 2 adults.
- Month: September 2026.
- Preferred part of month: second half of September.
- Departure/return airport: Kraków, Poland.
- Trip duration variants:
  - 7/8 days,
  - 11/12 days,
  - 14/15 days.
- Accommodation requirements:
  - private bathroom,
  - washing machine is a strong requirement,
  - apartment/hotel acceptable,
  - Airbnb can be added later, but current verified listings are Booking.com-based.
- Transportation:
  - rental car class B/C,
  - include fuel and parking assumptions.
- Destination qualities:
  - warm and clear water,
  - snorkeling potential,
  - turtles if possible,
  - cliffs,
  - nature parks,
  - mountains,
  - lakes/lagoons where relevant,
  - towns, museums, and cultural sites.

### Current destination logic

- **Albania** wins for budget and confirmed washing-machine availability.
- **Zakynthos** wins for turtles, but has weak washing-machine availability in the current source set.
- **Cyprus** wins for balanced weather, water, culture, and logistics, but costs more than Albania.

Rejected or secondary options:

- Italy / Bari / Apulia: attractive, but total cost too high after accommodation and car.
- Malta: cheap flights, expensive qualifying accommodation.
- Rodos / Korfu / Kreta: viable, but not currently better than Zakynthos for turtles or Cyprus/Albania for balance/cost.
- Larnaka vs Pafos: Pafos/Polis/Latchi chosen for Akamas, Lara Bay, Blue Lagoon, and turtles.

---

## Source-of-truth hierarchy

When regenerating reports, use this order of trust:

1. **Raw source Markdown files** in `sources/*.md`
   - `sources/albania.md`
   - `sources/grecja.md`
   - `sources/cypr.md`

2. **Structured CSV matrices**
   - `sources/ultimate_booking_matrix.csv`
   - `sources/booking_pralka_matrix.csv`

3. **Audited previous reports**
   - `sources/ultimate_raport_wakacje_2026_AUDITED_desktop.html`
   - `sources/ultimate_raport_wakacje_2026_AUDITED_mobile.html`

4. **Earlier reports**
   - useful for reconstructing historical reasoning and estimates.

5. **New external sources**
   - use only if explicitly provided or freshly verified.
   - Always mark updated data as new and date-stamped.

Do not treat old prices as live prices. They are historical estimates from the analysis session.

---

## Accommodation data model

Every accommodation row should preserve at least:

```text
country
destination_region
variant_group          # A / B / C
property_name
booking_url
price_pln
booking_score
review_count
washing_status
washing_machine_confirmed
washing_machine_only_in_review
laundry_service_only
private_bathroom
kitchen_or_kitchenette
beachfront
sea_view
parking
beach_info_booking
nice_beach_distance_estimate
selection_score_1_10
notes
source_file
source_anchor_or_slug
```

### Washing-machine classification

Use these exact statuses:

1. `confirmed washing machine`
   - Official Booking.com tags or property description contain `Washing machine`, `washer`, or equivalent.

2. `washing machine only in review`
   - Only guest reviews mention washing machine / washer.

3. `laundry service only`
   - Official data mentions laundry, laundry service, dry cleaning, or similar, but not a washing machine in the unit.

4. `no washing data`
   - No relevant washing/laundry evidence found.

Important:

- A laundry service is not the same as a washing machine in the apartment.
- A guest review is weaker evidence than official property tags or description.
- The exact booked room/apartment type must still be manually verified before payment.

---

## Adding a new destination

To add a new destination, create a new raw Markdown source file in `sources/`, for example:

```text
sources/malta.md
sources/crete.md
sources/rhodes.md
sources/italy-apulia.md
```

The file should follow the same structure as the existing country files where possible:

```markdown
# Accommodation Offers – Destination

## Offer Index

| No. | Hotel name | Details anchor | Original Booking.com link |
| --- | --- | --- | --- |

---

<a id="property-slug"></a>

## Property Name

**Address:** ...
**Score:** ...

### Subscores
...

### Main facilities
...

### All facilities / Tags
...

### About the property
...

### Available rooms / apartments
...

### Guest reviews
...

### Area info
...

### House rules
...

### FAQs
...
```

Then update the extraction script or regeneration logic to parse the new file and append rows to the accommodation matrix.

---

## Adding non-Booking accommodation sources

Non-Booking sources are allowed, especially Airbnb, direct hotel pages, Google Maps, or local apartment sites.

For each external listing, normalize it into the same data model.

Recommended fields for non-Booking sources:

```text
source_type              # Airbnb / direct / Google / local agency / manual
source_url
property_name
location
price
date_range
private_bathroom
washing_machine
kitchen
parking
beach_distance
review_score
review_count
cancellation_policy
notes
evidence_text
retrieved_at
```

Rules:

- Keep evidence text short and source-specific.
- Mark fields as `unknown` when not verified.
- Do not silently downgrade missing data into `false`.
- If the source has a “washer” filter, still verify it on the listing page.

---

## Report generation requirements

Every regenerated final report must include:

### Summary section

- Overall ranking.
- Best budget option.
- Best turtle option.
- Best balanced option.
- Main caveats.
- Confirmed-washer counts per country.
- Decision table by priority.

### Per-destination section

For each country/destination:

- recommended base,
- airport and route,
- flight duration variants,
- recommended dates,
- car estimate,
- total cost estimate,
- weather,
- sea temperature,
- rain risk,
- water clarity,
- snorkeling,
- turtles,
- cliffs,
- parks,
- mountains,
- lakes/lagoons where relevant,
- towns,
- museums,
- culture,
- pros and cons,
- top confirmed-washer offers,
- full A/B/C accommodation list.

### Accommodation cards/tables

Each accommodation should show:

- name,
- Booking/external link,
- price estimate,
- review score,
- review count,
- washing-machine status,
- kitchen,
- private bathroom,
- beachfront,
- sea view,
- parking,
- beach information,
- original nice-beach estimate if available,
- final score,
- concise notes,
- expandable source-derived details.

### Audit section

Include:

- files used,
- what was restored from earlier reports,
- known limitations,
- what requires manual verification,
- update date.

---

## Desktop vs mobile output rules

### `ultimate-desktop.html`

Should prioritize:

- wide comparison tables,
- full country-level tables,
- dense data visibility,
- desktop-friendly scanning,
- still readable if printed to PDF.

### `ultimate-mobile.html`

Should prioritize:

- bottom tab navigation,
- card layout,
- short summary first,
- large tap targets,
- no horizontal scrolling where avoidable,
- concise accommodation cards with expandable details.

The two reports should contain the same decision logic and data, but layouts can differ.

---

## Scoring method

The current selection score is heuristic. It may combine:

- Booking score,
- review count confidence,
- price,
- confirmed washing machine,
- kitchen,
- private bathroom,
- beach proximity,
- beachfront / sea view,
- destination fit,
- risk notes.

Suggested score modifiers:

```text
+ confirmed washing machine
+ kitchen / kitchenette
+ private bathroom
+ beachfront / sea view
+ low price
- very high price
- no review score
- low review count
- only laundry service when washer is required
```

Scores are not absolute quality ratings. They are **selection usefulness ratings for this specific trip**.

---

## Regeneration workflow

1. Read `README.md`.
2. Load raw source Markdown files from `sources/`.
3. Load `sources/ultimate_booking_matrix.csv` if present.
4. Parse all accommodation records.
5. Reclassify washing-machine status from raw text.
6. Merge with historical price and variant data.
7. Preserve previous trip logic unless new data explicitly changes it.
8. Generate:
   - `ultimate-desktop.html`
   - `ultimate-mobile.html`
   - updated CSV matrix.
9. Add an audit section.
10. Do not claim live availability or live prices unless freshly checked.

---

## Recommended implementation approach

A simple Python generator is sufficient.

Suggested libraries:

```python
from pathlib import Path
from bs4 import BeautifulSoup
import csv
import re
import html
```

Suggested pipeline:

```text
parse Markdown sources
→ extract property sections
→ classify facilities
→ merge with existing CSV/report rows
→ compute selection score
→ render HTML components
→ write desktop and mobile outputs
→ write CSV matrix
→ package ZIP
```

---

## Final regeneration prompt

Use this when asking an agent to rebuild the reports.

```text
You are given a travel-report package with:
- README.md
- AGENTS.md
- sources/albania.md
- sources/grecja.md
- sources/cypr.md
- sources/ultimate_booking_matrix.csv
- sources/raport_wakacje_wrzesien_2026_mobile.html
- sources/raport_wakacje_booking_pralka_v2_mobile.html
- sources/ultimate_raport_wakacje_2026_AUDITED_desktop.html
- sources/ultimate_raport_wakacje_2026_AUDITED_mobile.html

Regenerate the final audited vacation reports:
- ultimate-desktop.html
- ultimate-mobile.html

Preserve all trip requirements:
- two people,
- September 2026,
- Kraków departure and return,
- optimized trip lengths 7/8, 11/12, 14/15 days,
- private bathroom,
- washing machine as a major requirement,
- car rental class B/C,
- warm clear water,
- turtles, cliffs, parks, mountains, lakes/lagoons, towns, museums, culture.

Use the raw Markdown files as source of truth for accommodation facilities.
Classify washing-machine status into:
1. confirmed washing machine,
2. washing machine only in review,
3. laundry service only,
4. no washing data.

Keep Albania, Zakynthos, and Cyprus as final destinations.
Include rejected alternatives and why they were rejected.
Include all A/B/C accommodation variants and top 10 rows where available.
Include both Booking beach information and the earlier nice-beach estimate when available.
Include an audit section and known limitations.
Do not claim that historical prices are live prices.
```

---

## Quality checklist for agents

Before returning regenerated reports, verify:

- [ ] Root files are named exactly `ultimate-desktop.html` and `ultimate-mobile.html`.
- [ ] `sources/` is not deleted.
- [ ] Albania / Greece / Cyprus are all present.
- [ ] Rejected alternatives are explained.
- [ ] Flight duration variants are present.
- [ ] Costs, car, weather, water, turtles, cliffs, culture are present.
- [ ] A/B/C accommodation lists are present.
- [ ] Washing-machine status is reclassified from raw sources.
- [ ] Desktop report has tables.
- [ ] Mobile report has cards.
- [ ] Known limitations are stated.
- [ ] README and AGENTS remain consistent with file paths.
