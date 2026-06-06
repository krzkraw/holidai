# Gemini Holiday Dashboard Review

What this is: review of `2026-holidai-v1.html` and `2026-holidai-v2.html` against the GPT final baseline and the original Booking.com source matrix.

Scope: `gemini/2026-holidai-v1.html`, `gemini/2026-holidai-v2.html`, `gpt/ultimate-desktop.html`, `gpt/ultimate-mobile.html`, and `gpt/sources/ultimate_booking_matrix.csv`.

Date: 2026-06-06.

## Headline Finding

The Gemini dashboards are not faithful regenerations of the GPT outputs. They are exploratory redesigns with new destinations and a new synthetic hotel database.

For the original three destinations, both Gemini files dropped all 90 verified GPT/Booking accommodation rows, all original Booking.com property names, and all original Booking URLs. They replaced them with 9 untraceable hotel rows per destination.

## Baseline From GPT

| Destination | GPT matrix rows | Unique GPT properties | Unique confirmed washer | Key GPT accommodation finding |
| --- | ---: | ---: | ---: | --- |
| Albania | 30 | 23 | 11 | Strongest budget + washer supply. |
| Zakynthos | 30 | 19 | 1 | Best turtles, but washer requirement is weak; Dakis Studios is the main confirmed option. |
| Cypr | 30 | 21 | 9 | Best weather/culture/logistics balance, but more expensive. |

## Gemini v1 Matrix: GPT Ultimate -> Gemini v1

| Information layer | Still present in v1 | Dropped/degraded in v1 | New in v1 | Action |
| --- | --- | --- | --- | --- |
| Original constraints | KRK departure, two-person framing, September 2026, washer importance, car rental, water/turtles/nature logic. | Full GPT trip-duration variants and several exact cost ranges are gone from destination dossiers. | Interactive matchmaker and integrated calculator. | Keep the UI idea, restore the full constraint table. |
| Accommodation data | A/B/C grouping concept and washer labels remain. | All 90 GPT Booking rows, all real GPT property names, all Booking URLs, exact CSV fields, and raw-source traceability are gone. | 45-row JS array: 9 per destination, including new Turkey and Crete rows. | Treat v1 hotel data as unverified placeholder data unless source URLs are added. |
| Washer evidence | v1 warns that hotel laundry is not the same as a private washer. | GPT's verified statuses are replaced with `TAK`, `CZĘŚCIOWO`, `NIEPOTWIERDZONA`. Zakynthos is made to look washer-rich despite GPT having only 1 unique confirmed washer property. | New simplified washer status taxonomy. | Rebuild hotel rows from `ultimate_booking_matrix.csv`; do not infer washer status. |
| Costs | GPT flight baselines are mostly retained in calculator constants: Albania 358, Zakynthos 1280, Cypr 1046. | GPT per-destination A/B/C total-cost tables and 7/8, 11/12, 14/15 variants are largely dropped. | New hotel-rate, food-factor, local-buffer model. | Mark calculator constants as assumptions and keep GPT historical prices visible. |
| Rejected alternatives | Italy rejection remains. | Malta, Rhodes/Corfu/Crete-as-previously-rejected, and Larnaka-vs-Pafos reasoning are mostly dropped. | Turkey and West Crete enter the active shortlist. | Restore rejected-alternative history. |
| Destination narrative | Albania budget/long TIA transfer, Zakynthos turtles, Cyprus Akamas/Lara/Pafos logic still survive. | Lakes/lagoons/towns/museums layer is compressed. Cyprus loses part of Polis/Latchi nuance in top labels. | Turkey and Crete narrative sections. | Separate verified inherited facts from new research claims. |

## New Destinations in v1

| Destination | What v1 adds | Review |
| --- | --- | --- |
| Turkey Egejska: Fethiye / Kaş / Dalyan | AYT routing, D400 transfer, Kaş snorkeling, İztuzu/Dalyan/DEKAMER turtles, Butterfly Valley, Saklıkent, Kaputaş, Kayaköy, Kekova, 9 hotel rows. | Directionally useful, but no source trail. Claims like `100%` turtle guarantee and all hotel washer statuses need verification before ranking against GPT data. |
| Kreta Zachodnia: Chania / Kissamos / Rethymno | CHQ routing, Balos, Elafonisi, Seitan Limania, Samaria, ARCHELON turtle framing, Autopapas/no-deposit rental note, 9 hotel rows. | Useful new candidate, but the hotel list and rental/insurance claims are unverified in this artifact. |

## Gemini v2 Matrix: Source/GPT -> v1 -> v2

| Layer | GPT source/GPT final | Gemini v1 | Gemini v2 | Status / action |
| --- | --- | --- | --- | --- |
| Accommodation source traceability | 90 verified Booking rows with URLs and source Markdown. | Replaced by 45 synthetic JS rows. | Still 45 synthetic rows; no original names or Booking URLs. | Severe drop. Rebuild from real CSV/URLs. |
| Hotel fields | Name, URL, price, Booking score, review count, washing status, kitchen, private bathroom, beachfront, sea view, parking, beach text, selection score. | Keeps name, price, rating, review count, type, wash, beach, score, comment. | Drops review count, type, selection score, and comment; adds `price14d` and short description. | v2 degrades v1's already unverified hotel model further. |
| Original 3 destination names | Albania/Saranda/Ksamil/Himarë; Zakynthos; Cyprus/Pafos/Polis/Latchi/Akamas. | Mostly retained; Cyprus title drops some Polis nuance in one place. | Retained in dossiers. | Narrative mostly retained. |
| Flight costs for original 3 | Albania 358 PLN / 2 os.; Zakynthos 1280 PLN / 2 os.; Cypr 1046 PLN / 2 os. | Calculator uses those same values. | `regionLogistics` doubles them: Albania 716, Zakynthos 2560, Cypr 2092, while labeling them as cost for 2 people. | Material regression; fix constants or explain why the model changed. |
| Trip variants | GPT has 7/8, 11/12, 14/15-day variants. | Mostly collapsed into one recommended date per dossier plus calculator. | Collapsed further into interactive parameters. | Restore variant tables if this is meant as a handoff report. |
| Washer truth for Zakynthos | Only 1 unique confirmed washer property. | Multiple synthetic Zakynthos rows claim `TAK`. | Multiple synthetic Zakynthos rows still claim `TAK`. | Severe contradiction with GPT source set. |
| Cyprus washer nuance | 9 unique confirmed, 1 review-only, 1 laundry/service-only. | Simplified and untraceable. | Simplified and untraceable; many fake rows claim `TAK`. | Restore exact status categories. |
| Rejected alternatives | Italy, Malta, Rhodes/Corfu/Crete, Larnaka vs Pafos. | Keeps only Italy. | Drops the rejected-alternative layer. | Restore full history to avoid repeating old branches. |
| New critical checks | GPT has booking pre-checklist. | Adds Balos road, left-side Cyprus, credit card, washer verification. | Adds deposit, washer message template, baggage dimensions, passport/document validity. | Useful, but source-sensitive claims need citations or manual verification. |

## Main 3 Destinations: Information Tracking

| Destination | Source/GPT baseline | Still in Gemini v2 | Dropped or changed by Gemini | Added by Gemini | Action |
| --- | --- | --- | --- | --- | --- |
| Albania | 30 rows / 23 unique properties; 11 unique confirmed washers; real top options include Oni's Apartments, Koli Apartaments, Amaris, The View Above, Apartments Sadiku, Esmeralda; KRK-TIA; 16-30 Sep; long Tirana-Saranda transfer; Butrint, Blue Eye, Llogara, Gjipe, Himarë. | Budget positioning, difficult TIA transfer, Butrint/Gjirokastra/Llogara/Gjipe, poor turtle certainty. | All real properties/URLs dropped; flight cost doubled in v2 constants; full trip variants and cost ranges removed. | Synthetic Albania hotel rows and stronger negative snorkeling framing. | Use GPT matrix for accommodations; keep Gemini narrative only as commentary. |
| Zakynthos | 30 rows / 19 unique properties; 1 unique confirmed washer, mainly Dakis Studios; best turtle destination; KRK-ZTH; 12-26 Sep; Laganas/Kalamaki/Marathonisi/Gerakas/Dafni/Keri/Blue Caves/Navagio. | Turtle and marine-park narrative remains. | Dakis Studios and all GPT properties/URLs dropped; Gemini invents many washer-positive rows; v2 doubles flight cost. | More polished strategic table and matchmaker scoring. | Restore the `washer weak` warning prominently; do not use Gemini hotel rows. |
| Cypr | 30 rows / 21 unique properties; 9 unique confirmed washers; 1 review-only washer; 1 laundry/service-only; KRK-PFO; 14-25 Sep; Pafos/Polis/Latchi/Akamas; Lara Bay, Blue Lagoon, Avakas, Pafos UNESCO; left-side driving. | Akamas/Lara/Blue Lagoon/Pafos and left-side driving survive. | Real property set and Booking URLs dropped; review-only/laundry nuance removed; v2 doubles flight cost. | Stronger premium snorkeling phrasing and tactical checklist. | Restore exact accommodation rows and status categories; keep new checklist items only after verification. |

## New Destinations: v1 -> v2

| Destination | v1 data | v2 changes | Review |
| --- | --- | --- | --- |
| Turkey Egejska | 9 unverified hotel rows with names such as Yacht Classic Hotel Fethiye, La Kumsal Hotel Kaş, Sunset Beach Villas Fethiye; flight 1650; car/day 105; Kaş snorkeling and Dalyan turtles. | Names shortened with tier suffixes, `price14d` added, review counts/type/score dropped; flight becomes 3300; passport/150-day document warning added. | Potentially valuable candidate, but hotel and document/rental claims need source URLs and date-stamped verification. |
| Kreta Zachodnia | 9 unverified hotel rows; flight 1900; car/day 120; Balos/Elafonisi/Samaria/ARCHELON; no-deposit rental claim. | Names shortened with tier suffixes, `price14d` added, review counts/type/score dropped; flight becomes 3800; Meltemi and local rental details emphasized. | Good research direction; not a verified dashboard. Rebuild from real Booking/Airbnb/direct source rows. |

## Recommended Fix Path

1. Treat `gemini/*.html` as UI/research prototypes, not source-of-truth reports.
2. Rebuild the first three destination hotel catalogs from `gpt/sources/ultimate_booking_matrix.csv`.
3. Add source URLs for all Turkey and Crete hotels before comparing them to GPT destinations.
4. Fix v2 doubled flight constants or document that they intentionally changed.
5. Restore the rejected-alternatives section from GPT so Malta, Rhodes/Corfu/Crete history, and Larnaka-vs-Pafos logic are not lost.
6. Add a validation script that checks Gemini outputs for original GPT property names/links when the task is regeneration rather than new exploration.

## Bottom Line

Gemini v1 and v2 are useful as design explorations and as prompts for adding Turkey/West Crete, but they are not reliable continuations of the verified GPT pipeline. The biggest data loss is accommodation traceability: every verified GPT Booking row disappears, and v2 introduces a separate flight-cost regression for the original destinations.
