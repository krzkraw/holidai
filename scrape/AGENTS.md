# AGENTS.md

Operating contract for autonomous agents working in this workspace (`~/Dev/holidai/scrape`).

## 1. Project Context & Workspace Map

This workspace contains tooling to verify, update, and detail a Booking.com CSV matrix file using an automated script connected to a running Google Chrome Beta session via the Chrome Debugging Protocol (CDP).

- **Script:** [verify_matrix.py](file:///Users/krz/Dev/holidai/scrape/verify_matrix.py)
- **Plan:** [scrape-plan.md](file:///Users/krz/Dev/holidai/scrape/scrape-plan.md)
- **Input CSV Directory:** `/Users/krz/Dev/holidai/research/`
  - Example: `booking_matrix_turcja_kreta.csv` or `booking_matrix_albania_grecja_cypr.csv`
- **Output Verified CSV:** `/Users/krz/Dev/holidai/scrape/{csv_name}_VERIFIED.csv`
- **Progress Cache:** `/Users/krz/Dev/holidai/scrape/{csv_name}_cache.json` (enables resumability)
- **Markdown Outputs Directory:** `/Users/krz/Dev/holidai/scrape/{csv_name}_MD/`
- **Discrepancy Report:** `/Users/krz/Dev/holidai/scrape/{csv_name}_discrepancies.md`

---

## 2. Prerequisites & Chrome Beta Setup

Before running the verification script, Chrome Beta must be running with port debugging enabled:

1. **Quit Chrome Beta completely** (ensure no background processes are running: `Cmd + Q`).
2. **Launch Chrome Beta via Terminal** with the remote debugging parameter:
   ```bash
   "/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta" --remote-debugging-port=9222
   ```
3. **Log in** to your Booking.com account in that browser instance (this ensures Genius discounts and currency are applied).

---

## 3. Iteration & Scraping Rules (Execution Logic)

1. **Uniqueness:** Group CSV rows by the base hotel URL (parameters stripped) and name.
2. **Stay Lengths:** Iteratively open URLs for 8, 11, and 14 days (constructed via checkout parameter).
3. **Prices:** Read the exact price for each stay length. If unavailable or sold out, record `-1`.
4. **Scrolling & Expansion:** Scroll to the bottom of each page to trigger lazy loading. Click `#facilities-tab-trigger` and wait 1 second to load complete amenities.
5. **Washing Machine Verification (`pralka`):**
   - Check room details and facilities for "pralka", "washing machine", "pralki", etc.
   - If found in facilities/rooms: `pralka_potwierdzona = True`, `pralka_tylko_opinia = False`.
   - If found only in general text (reviews): `pralka_potwierdzona = False`, `pralka_tylko_opinia = True`.
   - Otherwise, both are `False`.
6. **Other Features:** Extract boolean indicators for laundry service (`usluga_prania`), kitchen (`kuchnia`), private bathroom (`prywatna_lazienka`), beachfront, sea view, and parking.
7. **Markdown Files per Hotel:** Generate `{Country}-{HotelName}.md` containing:
   - A) Header Section: Hotel name, full address, geographic coordinates, visible photo links.
   - B) Availability: stay prices and a formatted markdown table of all rooms.
   - C) Guest Reviews: rating, review count, list of up to 10 comments.
   - D) Surroundings: Neighborhood (Area Info).
   - E) Property Facilities: list of all amenities and washing machine summary.
   - F) House Rules & Important Info: regulamin (House Rules) and ważne informacje (Important Info).
   - Podsumowanie (autorska ocena): location, washing machine, beach distance, price-to-quality.
8. **Stuck Handling:** If the title is empty (CAPTCHA) or navigation fails, print an alert to stdout and wait for stdin. If no input is received within 20 seconds, mark the price as `TBD` and proceed to the next hotel.

---

## 4. Execution Commands

To run the verification process for a single CSV file:
```bash
python3 /Users/krz/Dev/holidai/scrape/verify_matrix.py [/Users/krz/Dev/holidai/research/booking_matrix_turcja_kreta.csv]
```
If no argument is passed, it defaults to `booking_matrix_turcja_kreta.csv`.
Progress is tracked and printed automatically on launch from `{csv_base}_cache.json`.
