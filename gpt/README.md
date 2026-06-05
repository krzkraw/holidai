# README — Final Codex Package

This package is structured for opening in Codex or any code editor.

## Main files

- `ultimate-desktop.html` — final audited desktop report.
- `ultimate-mobile.html` — final audited mobile report.
- `README.md` — human-readable file guide and handoff prompts.
- `AGENTS.md` — agent/developer instructions for extending and regenerating reports.
- `sources/` — extracted source bundle containing all prior reports, CSV matrices, and raw Booking.com Markdown property cards.

---

# README — Holiday Report Artifacts, September 2026

This folder contains the full working set for the **September 2026 holiday comparison for two people**.

The final deliverables are the **AUDITED ultimate reports**:

- `ultimate-desktop.html`
- `ultimate-mobile.html`
- `sources/  (extracted source bundle)`

The analysis scope was narrowed to:

1. **Albania** — Saranda / Ksamil / optional Himarë
2. **Greece** — Zakynthos
3. **Cyprus** — Paphos / Polis / Latchi / Akamas

Italy and Malta were considered earlier and then dropped because the full trip cost was worse than expected.

---

## 1. Original requirements

The initial travel requirements were:

- 2 people.
- September 2026.
- Departure and return: **Kraków**.
- Trip length: initially 10–15 days, later expanded into optimized variants:
  - 7/8 days,
  - 11/12 days,
  - 14/15 days.
- Accommodation:
  - Airbnb or hotel/apartment,
  - private bathroom,
  - washing machine preferred / later treated as a hard practical criterion.
- Rental car:
  - class B or C.
- Warm and clear water.
- Mediterranean-style destination.
- Interest in:
  - turtles,
  - cliffs,
  - nature parks,
  - mountains,
  - lakes/lagoons,
  - towns,
  - museums,
  - cultural sites.

---

## 2. Chronological timeline of files

### Stage 1 — First full HTML report

#### `raport_wakacje_wrzesien_2026_albania_grecja_cypr.html`

**Purpose:**  
First full HTML comparison after Italy was dropped and the shortlist became Albania / Greece / Cyprus.

**Contains:**

- Albania, Greece, Cyprus tabs.
- Flights from Kraków.
- Estimated total cost.
- Weather and water estimates.
- Initial accommodation shortlist.
- Rental car estimates.
- Turtles / cliffs / nature / culture sections.
- Initial Booking.com offer links.

**Known limitation:**  
At this stage, washing machine status was mostly inferred from Booking.com search results, not full property cards.

---

### Stage 2 — Mobile-friendly report

#### `sources/raport_wakacje_wrzesien_2026_mobile.html`

**Purpose:**  
Mobile-friendly version intended to be sent to a partner.

**Contains:**

- Bottom mobile tab navigation.
- Card-style accommodation layout.
- Short summary:
  - Albania = cheapest,
  - Zakynthos = turtles,
  - Cyprus = best balance.
- Same general travel logic as Stage 1.

**Known limitation:**  
Still did not verify washing machine status from full Booking.com property pages.

---

### Stage 3 — Raw Booking.com property files provided by user

#### `sources/albania.md`

**Purpose:**  
Full raw Booking.com property cards for Albania.

**Contains:**

- Offer index.
- Original Booking.com links.
- Full property cards.
- Address.
- Review score.
- Facilities.
- Full amenity tags.
- Property description.
- Available room/apartment types.
- Guest reviews.
- Area info.
- House rules.
- FAQ.

**Used for:**  
Verifying whether each property has `Washing machine`, only laundry services, or no washing-related facility.

---

#### `sources/grecja.md`

**Purpose:**  
Full raw Booking.com property cards for Greece / Zakynthos.

**Contains:**

- Offer index.
- Original Booking.com links.
- Full property cards.
- Facilities and amenity tags.
- Room types.
- Guest reviews.
- Area info.
- House rules.
- FAQ.

**Used for:**  
Checking whether Zakynthos options actually support the washing-machine requirement.

**Important outcome:**  
Only a very small number of Zakynthos offers clearly satisfied the washing machine criterion.

---

#### `sources/cypr.md`

**Purpose:**  
Full raw Booking.com property cards for Cyprus.

**Contains:**

- Offer index.
- Original Booking.com links.
- Full property cards.
- Facilities and amenity tags.
- Room types.
- Guest reviews.
- Area info.
- House rules.
- FAQ.

**Used for:**  
Checking washing-machine availability and improving Cyprus accommodation ranking.

---

### Stage 4 — Washing machine verification report

#### `sources/booking_pralka_matrix.csv`

**Purpose:**  
First structured CSV matrix focused on washing-machine verification.

**Contains columns such as:**

- country,
- variant,
- property name,
- price,
- Booking rating,
- review count,
- washing status,
- washing machine confirmed,
- washing machine only in review,
- laundry service,
- kitchen/kitchenette,
- private bathroom,
- beachfront,
- beach info,
- final selection score,
- Booking.com link.

**Useful for:**  
Filtering offers by washing machine and country.

---

#### `sources/raport_wakacje_booking_pralka_v2_mobile.html`

**Purpose:**  
Mobile report focused on corrected washing-machine status.

**Contains:**

- Updated accommodation cards.
- Washing-machine status based on full Booking.com property cards.
- Corrected counts:
  - Albania had many confirmed washing-machine options,
  - Greece had very few,
  - Cyprus had several but generally higher-cost options.

**Known limitation:**  
This version over-focused on accommodation and dropped too much of the earlier travel context.

---

### Stage 5 — First “ultimate” report

#### `sources/ultimate_booking_matrix.csv`

**Purpose:**  
Expanded CSV matrix combining accommodation data and verified Booking.com fields.

**Contains:**

- country,
- A/B/C variant,
- property name,
- price,
- Booking score,
- reviews,
- washing status,
- washing-machine flags,
- kitchen flag,
- private bathroom flag,
- beachfront flag,
- sea-view flag,
- parking flag,
- beach info,
- selection score,
- link.

**Useful for:**  
Spreadsheet filtering and ranking.

---

#### `sources/ultimate_raport_wakacje_2026_desktop.html`

**Purpose:**  
First desktop-oriented “ultimate” report.

**Contains:**

- Decision summary.
- Flights and trip-length variants.
- Cost estimates.
- Weather and water.
- Nature and culture.
- Accommodation tables and cards.
- Washing-machine verification.

**Known limitation:**  
It still did not fully restore every detail from the conversation history.

---

#### `sources/ultimate_raport_wakacje_2026_mobile.html`

**Purpose:**  
First mobile-oriented “ultimate” report.

**Contains:**

- Same major content as the desktop report.
- Mobile card layout.
- Bottom tab navigation.

**Known limitation:**  
Some audit-level details were still missing:
- rejected-destination history,
- Booking vs Airbnb note,
- lake/lagoon/museum layer,
- original “beautiful beach distance” estimate,
- explicit source-file explanation.

---

### Stage 6 — Audited ultimate reports

#### `ultimate-desktop.html`

**Purpose:**  
Final audited desktop report.

**Contains all major layers from the conversation:**

- Original requirements.
- Final country shortlist.
- Rejected alternatives:
  - Italy / Bari / Apulia,
  - Malta,
  - Rodos / Korfu / Kreta,
  - Larnaka vs Pafos.
- Flight variants:
  - 7/8 days,
  - 11/12 days,
  - 14/15 days.
- Recommended dates.
- Estimated total costs.
- Car and fuel/parking assumptions.
- Weather, water temperature, rain risk.
- Water clarity.
- Turtles.
- Cliffs.
- Nature parks.
- Mountains.
- Lakes/lagoons.
- Towns, museums, and cultural sites.
- Accommodation variants A/B/C.
- Top offers with confirmed washing machine.
- Full Booking-derived accommodation cards.
- “Beach according to Booking” and original estimated beautiful-beach distance.
- Completeness checklist.
- Interpretation of washing-machine status.

**Recommended file for:**  
Desktop review, comparison, and planning.

---

#### `ultimate-mobile.html`

**Purpose:**  
Final audited mobile report.

**Contains:**  
The same core content as the audited desktop report, reformatted for phone use.

**Recommended file for:**  
Sending to another person, reading on mobile, quick decision-making.

---

### Stage 7 — Full package

#### `sources/  (extracted source bundle)`

**Purpose:**  
Portable package containing the audited reports, source files, matrices, and previous report versions.

**Contents detected in ZIP:**

- `sources/albania.md`
- `sources/booking_pralka_matrix.csv`
- `sources/cypr.md`
- `sources/grecja.md`
- `sources/raport_wakacje_booking_pralka_v2_mobile.html`
- `sources/raport_wakacje_wrzesien_2026_mobile.html`
- `sources/ultimate_booking_matrix.csv`
- `ultimate-desktop.html`
- `ultimate-mobile.html`

**Recommended use:**  
Share or archive this ZIP when you want the complete trail, not only the final HTML.

---

## 3. File inventory

| File | Present | Size | Modified |
| --- | --- | ---: | --- |
| `raport_wakacje_wrzesien_2026_albania_grecja_cypr.html` | yes | 79.5 KB | 2026-06-05T20:46:04 |
| `sources/raport_wakacje_wrzesien_2026_mobile.html` | yes | 83.5 KB | 2026-06-05T20:46:04 |
| `sources/albania.md` | yes | 167.8 KB | 2026-06-05T20:46:04 |
| `sources/grecja.md` | yes | 160.6 KB | 2026-06-05T20:46:04 |
| `sources/cypr.md` | yes | 180.8 KB | 2026-06-05T20:46:04 |
| `sources/booking_pralka_matrix.csv` | yes | 33.1 KB | 2026-06-05T20:46:04 |
| `sources/raport_wakacje_booking_pralka_v2_mobile.html` | yes | 330.8 KB | 2026-06-05T20:46:04 |
| `sources/ultimate_booking_matrix.csv` | yes | 34.1 KB | 2026-06-05T20:46:04 |
| `sources/ultimate_raport_wakacje_2026_desktop.html` | yes | 466.4 KB | 2026-06-05T20:46:04 |
| `sources/ultimate_raport_wakacje_2026_mobile.html` | yes | 399.2 KB | 2026-06-05T20:46:04 |
| `ultimate-desktop.html` | yes | 445.2 KB | 2026-06-05T20:46:04 |
| `ultimate-mobile.html` | yes | 390.4 KB | 2026-06-05T20:46:04 |
| `sources/  (extracted source bundle)` | yes | 248.7 KB | 2026-06-05T20:46:04 |

---

## 4. How to use the files

### For final reading

Use:

```text
ultimate_raport_wakacje_2026_AUDITED_mobile.html
```

for phone reading, or:

```text
ultimate_raport_wakacje_2026_AUDITED_desktop.html
```

for desktop review.

### For filtering accommodation options

Use:

```text
ultimate_booking_matrix.csv
```

Suggested filters:

- `pralka_potwierdzona = TRUE`
- `kraj = Albania / Grecja / Cypr`
- sort by `ocena_wyboru_1_10` descending,
- then sort by `cena_pln` ascending.

### For checking raw Booking.com data

Use:

```text
albania.md
grecja.md
cypr.md
```

Search inside them for:

```text
Washing machine
laundry
Private bathroom
Beachfront
Kitchen
Sea view
```

---

## 5. Handoff prompts

These prompts are meant to help another assistant or future session understand what action to take next.

### Prompt: continue from final audited reports

```text
I have a vacation planning package for September 2026 with audited reports:
- ultimate_raport_wakacje_2026_AUDITED_desktop.html
- ultimate_raport_wakacje_2026_AUDITED_mobile.html
- ultimate_booking_matrix.csv
- albania.md
- grecja.md
- cypr.md

Please treat the AUDITED reports as the latest narrative version and the CSV/MD files as structured/source data. Continue from there without restarting the whole analysis.
```

### Prompt: verify accommodation washing-machine status

```text
Using albania.md, grecja.md, cypr.md and ultimate_booking_matrix.csv, verify whether each accommodation has:
1. confirmed washing machine,
2. only laundry service,
3. washing machine mentioned only in a guest review,
4. no washing-related facility.

Prioritize official Booking.com tags and property descriptions over guest reviews.
```

### Prompt: update prices before booking

```text
Using the existing audited report as the planning baseline, update only current prices and availability for:
- flights from Kraków,
- Booking.com accommodation links,
- car rental class B/C.

Do not change the destination logic unless new prices materially change the ranking.
Return an updated cost table and mark every changed value.
```

### Prompt: compare only confirmed-washer options

```text
From ultimate_booking_matrix.csv, filter only rows where pralka_potwierdzona is TRUE.
Group by country and sort by:
1. ocena_wyboru_1_10 descending,
2. cena_pln ascending.

Return the top 5 per country and explain which one is best for a couple.
```

### Prompt: create a short shareable summary

```text
Based on ultimate_raport_wakacje_2026_AUDITED_mobile.html, create a short message I can send to my partner.
Keep it under 250 words.
Include:
- best budget option,
- best turtle option,
- best balanced option,
- estimated total cost,
- main caveat for each.
```

### Prompt: produce final booking shortlist

```text
Using the audited report and CSV, prepare a final shortlist of 3 options only:
1. cheapest acceptable,
2. best overall,
3. best for turtles.

For each option include:
- country/region,
- exact dates,
- flights,
- accommodation link,
- washing-machine status,
- car estimate,
- total estimated cost,
- why choose it,
- what to verify before payment.
```

### Prompt: check whether Albania still wins

```text
Using the audited package, check whether Albania still wins if:
- checked luggage costs 800 PLN total,
- car insurance adds 900 PLN,
- we require confirmed washing machine,
- we require rating at least 8.5.

Compare against Cyprus and Zakynthos.
```

---

## 6. Final regenerate prompt

Use this prompt when you want to regenerate the final audited report from the provided files.

```text
You are given the following files:
- raport_wakacje_wrzesien_2026_mobile.html
- raport_wakacje_booking_pralka_v2_mobile.html
- ultimate_booking_matrix.csv
- albania.md
- grecja.md
- cypr.md

Regenerate a complete audited vacation report for two people for September 2026.

Requirements:
1. Include all original travel constraints:
   - departure and return: Kraków,
   - 2 people,
   - September 2026, preferably second half of the month,
   - optimized durations: 7/8, 11/12, 14/15 days,
   - accommodation with private bathroom,
   - washing machine as a major criterion,
   - car rental class B/C,
   - warm and clear water.
2. Include all final destinations:
   - Albania: Saranda / Ksamil / optional Himarë,
   - Greece: Zakynthos,
   - Cyprus: Paphos / Polis / Latchi / Akamas.
3. Include rejected alternatives and explain why:
   - Italy / Bari / Apulia,
   - Malta,
   - other Greek islands such as Rodos / Korfu / Kreta,
   - Larnaka vs Pafos on Cyprus.
4. For each destination include:
   - best base,
   - airport and route,
   - flight-length variants,
   - recommended dates,
   - car estimate,
   - total-cost estimate,
   - weather,
   - sea temperature,
   - rain risk,
   - water clarity,
   - snorkeling,
   - turtles,
   - cliffs,
   - parks,
   - mountains,
   - lakes/lagoons if relevant,
   - towns,
   - museums,
   - culture.
5. For accommodation:
   - preserve A/B/C variants,
   - keep top 10 offers per variant where available,
   - use albania.md / grecja.md / cypr.md as source of truth for facilities,
   - mark washing-machine status as:
     a. confirmed washing machine,
     b. washing machine only in review,
     c. only laundry service,
     d. no washing data,
   - include private bathroom, kitchen, beachfront, sea view, parking, Booking score, review count, beach info, and final selection score.
6. Include both:
   - “Beach according to Booking.com”,
   - original estimated nice-beach distance from the earlier report when available.
7. Create two HTML files:
   - desktop version with wide comparison tables,
   - mobile version with card layout and bottom navigation.
8. Create or update a CSV matrix with all accommodation rows.
9. Include an audit section explaining:
   - what files were used,
   - what was restored from earlier reports,
   - known limitations,
   - what must be manually verified before booking.
10. Do not claim live prices are still valid. Mark all prices as historical estimates from the generated analysis and require re-checking before booking.
```

---

## 7. Known limitations

- Prices and availability are historical estimates from the analysis session and must be rechecked before booking.
- Booking.com property facilities may vary by room/apartment type; the exact booked unit must still be checked.
- `Washing machine` in official Booking tags/description is stronger evidence than a guest review, but still should be confirmed before payment.
- Airbnb was discussed as potentially better for filtering `washer`, but no verified Airbnb listings are included in this package.
- Turtles are wildlife; even in Zakynthos or Cyprus, sightings are not guaranteed.

---

## 8. Recommended final workflow

1. Open `ultimate-mobile.html` for quick reading.
2. Open `ultimate-desktop.html` for full comparison.
3. Filter `sources/ultimate_booking_matrix.csv` by `pralka_potwierdzona = TRUE`.
4. Pick 3–5 accommodation finalists.
5. Recheck live flight prices.
6. Recheck live Booking.com prices and exact room facilities.
7. Recheck rental car deposit and insurance.
8. Decide between:
   - Albania = cheapest and best for washing-machine availability,
   - Zakynthos = turtles,
   - Cyprus = best balanced holiday.
