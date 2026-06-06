# Comprehensive Booking Matrix CSV Verification Plan

This plan details the structured and optimized process for automatic and semi-automatic verification of hotel data from a single CSV file against Booking.com.

The requirements in Section 3 are the source-of-truth scraper contract and must not be weakened or rephrased into softer guarantees without explicit user approval.

---

## 1. Browser Environment And Guardrails

To run the verification process correctly, the browser must be configured to use port `9222` for remote debugging.

> [!WARNING]
> **CRITICAL RULE FOR AI AGENTS:** Do not use `/goal`, subagents, timers, monitors, watcher loops, `browser_subagent`, `agent-browser`, or any other external browser tool. The scraper must run in one foreground terminal session against one Chrome debug session.

The browser setup must follow these rules:

1. Use stable Google Chrome with the dedicated profile at `/Users/krz/Dev/holidai/scrape/chrome-profile`.
2. If port `9222` is closed, the script may launch stable Google Chrome automatically.
3. The user is responsible for logging in to Booking.com and leaving exactly one Booking.com tab open.
4. Before navigation starts, the script must require the terminal response `OK`.
5. If the user does not enter `OK`, the run must exit cleanly before navigation.
6. The CDP helper must refuse to continue unless there is exactly one `type === "page"` target.

Launch command:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --remote-debugging-port=9222 --user-data-dir="/Users/krz/Dev/holidai/scrape/chrome-profile" "https://www.booking.com"
```

---

## 2. Dynamic Paths & Workspace Structure

All output files and progress tracking caches are stored inside `/Users/krz/Dev/holidai/scrape/`.

- **Script:** [verify_matrix.py](/Users/krz/Dev/holidai/scrape/verify_matrix.py)
- **Plan File:** [scrape-plan.md](/Users/krz/Dev/holidai/scrape/scrape-plan.md)
- **Input CSV Directory:** `/Users/krz/Dev/holidai/research/`
- **Output Verified CSV:** `/Users/krz/Dev/holidai/scrape/{csv_name}_VERIFIED.csv`
- **Progress Cache:** `/Users/krz/Dev/holidai/scrape/{csv_name}_cache.json`
- **Markdown Outputs Directory:** `/Users/krz/Dev/holidai/scrape/{csv_name}_MD/`
- **Discrepancy Report:** `/Users/krz/Dev/holidai/scrape/{csv_name}_discrepancies.md`

---

## 3. Iteration & Verification Rules

For each unique property, grouped by hotel name and base URL with checkout parameters stripped:

1. **Retrieve Prices for Stay Lengths (Availability):**
   - Sequentially open the URLs corresponding to stay lengths of 8, 11, and 14 days (e.g., checkout dates `2026-09-24`, `2026-09-27`, `2026-09-30`).
   - The price must be extracted exactly as shown on the page for that specific period. If the property is unavailable or sold out, record `-1`.
2. **Scrape and Verify Amenities:**
   - Verify the washing machine (`pralka`), distance to the beach (`plaza_booking` / `beachfront`), and private bathroom.
   - The script scrolls the page to trigger lazy loading of room options, reviews, and detailed facilities.
3. **Mandatory Markdown File Format per Property:**
   Individual `.md` files are saved as `{Country}-{HotelName}.md` in the directory `/Users/krz/Dev/holidai/scrape/{csv_name}_MD/`. They **must** include the following sections:
   - **A) Header Section:** Hotel name, full address, geographic coordinates (if visible on map pin/atlas attributes), main photo links (extracted from the page grid without opening the gallery modal), and the complete property description.
   - **B) Availability:** Prices for the stay lengths (8, 11, and 14 days) and a **precise, complete Markdown table of all room types and option details** (room name, occupancy, cancellation terms, price).
   - **C) Guest Reviews:** Overall rating score, review count, and a list of up to 10 visible guest comments.
   - **D) Surroundings (Area Info):** Detailed neighborhood attractions, cafes/restaurants, neighboring beaches, and airports.
   - **E) Property Facilities:** Complete checklist of all amenities, with a specific summary of the washing machine status (whether it is in the room, mentioned in reviews, or if only a paid laundry service is offered).
   - **F) House Rules & Important Info (MUST HAVE):** Property policies (House Rules) and the "Important Information" section.
   - **Summary and Author Review:** Short synthesis evaluating location, washing machine, beach distance, and price-to-quality ratio.
4. **Error Handling & Interaction:**
   - In case of a CAPTCHA or page loading issue, the script alerts the user in the terminal and waits **20 seconds** for input (pressing ENTER retries). If no input is received, it records `TBD` in the price column and proceeds to avoid blocking.
5. **CSV Source Of Truth:**
   - Read the CSV with `encoding="utf-8-sig"` so BOM-prefixed headers normalize correctly.
   - Country lookup order is `kraj`, then `\ufeffkraj`, then `Destynacja`.
   - Unique property grouping is `(base_url, hotel_name)`.
   - Counts come from the CSV, not from hardcoded expectations. For the current Albania file that means `90` rows and `23` unique properties unless the CSV changes.
6. **Timeouts And Recovery:**
   - CDP commands must use a `30s` timeout.
   - Python eval subprocess calls must use a `60s` timeout.
   - Timeout failures must kill the process and route back into the existing retry or `TBD` flow.

---

## 4. Verification Script Architecture (`verify_matrix.py`)

The verification script [verify_matrix.py](/Users/krz/Dev/holidai/scrape/verify_matrix.py) executes the following tasks:

### Step 4.1: Read and Group CSV Rows
- Takes the input CSV path as a command-line argument.
- Reads the CSV with BOM-safe handling.
- Groups unique hotels by `(base_url, hotel_name)` to avoid redundant page loading while preserving the correct property identity.
- Tracks and displays progress.

### Step 4.2: Scrape and Cache Iteration
- Loops through grouped properties.
- Opens the URLs via the single Chrome debug tab.
- Runs the extraction JS asynchronously.
- Saves intermediate progress to the corresponding local JSON cache file.

---

## 5. Verification Plan

### Automated Checks

```bash
PYTHONPYCACHEPREFIX=/tmp/holidai-pycache python3 -m py_compile /Users/krz/Dev/holidai/scrape/verify_matrix.py /Users/krz/Dev/holidai/chrome-scrape-control/chrome_control.py
node --check /Users/krz/Dev/holidai/chrome-scrape-control/cdp_helper.js
node --check /Users/krz/Dev/holidai/scrape/cdp_helper.js
python3 -c 'import csv, urllib.parse; rows=list(csv.DictReader(open("/Users/krz/Dev/holidai/research/booking_matrix_albania.csv", encoding="utf-8-sig"))); bases={(urllib.parse.urlparse(r["link"]).scheme, urllib.parse.urlparse(r["link"]).netloc, urllib.parse.urlparse(r["link"]).path, r["nazwa"]) for r in rows}; print(len(rows), len(bases), rows[0]["kraj"])'
```

Expected CSV sanity output: `90 23 Albania`.

### Manual Verification
- Check the generated markdown files folder.
- Inspect the discrepancy report.
- Spot check 3-5 rows in stable Google Chrome against the generated CSV.
