# Comprehensive Booking Matrix CSV Verification Plan

This plan details the structured and optimized process for automatic and semi-automatic verification of hotel data from a single CSV file against Booking.com.

---

## 1. Prerequisites & Browser Environment

To run the verification process correctly, the browser must be configured to use port `9222` for remote debugging so that `agent-browser` can interact with it.

The script simplifies this setup with the following automated behavior:

1. **Automatic Detection:**
   On startup, the script checks if port `9222` is already listening. If found, it uses the existing browser session directly.
2. **Automatic Launch:**
   If port `9222` is closed, the script automatically launches Google Chrome (or Google Chrome Beta if stable is not installed) in remote debugging mode with an isolated profile stored at `/Users/krz/Dev/holidai/scrape/chrome-profile`. This prevents locks or security conflicts on your main profile.
3. **Login Setup:**
   If launched automatically, the script opens Booking.com and prompts the user in the terminal:
   - Please log in to your Booking.com account in the opened browser window.
   - Once logged in, press `ENTER` in the terminal to proceed.
   - This login session and settings are saved persistently in `chrome-profile` for future runs.

## 2. Dynamic Paths & Workspace Structure

To keep the workspace self-contained and clean, all output files and progress tracking caches are stored inside the local project folder `/Users/krz/Dev/holidai/scrape/`.

- **Script:** [verify_matrix.py](file:///Users/krz/Dev/holidai/scrape/verify_matrix.py)
- **Plan File:** [scrape-plan.md](file:///Users/krz/Dev/holidai/scrape/scrape-plan.md)
- **Input CSV Directory:** `/Users/krz/Dev/holidai/research/`
  - Example: `booking_matrix_turcja_kreta.csv` or `booking_matrix_albania_grecja_cypr.csv`
- **Output Verified CSV:** `/Users/krz/Dev/holidai/scrape/{csv_name}_VERIFIED.csv`
- **Progress Cache:** `/Users/krz/Dev/holidai/scrape/{csv_name}_cache.json`
- **Markdown Outputs Directory:** `/Users/krz/Dev/holidai/scrape/{csv_name}_MD/`
- **Discrepancy Report:** `/Users/krz/Dev/holidai/scrape/{csv_name}_discrepancies.md`

---

## 3. Iteration & Verification Rules

For each unique property (mapped by hotel name and base URL, with checkout dates stripped):

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
5. **Pattern Learning:** The scraper reuses successfully discovered DOM selectors to speed up navigation.

---

## 4. Verification Script Architecture (`verify_matrix.py`)

The verification script [verify_matrix.py](file:///Users/krz/Dev/holidai/scrape/verify_matrix.py) executes the following tasks:

### Step 4.1: Read and Group CSV Rows
- Takes input CSV path as command-line argument (defaults to `/Users/krz/Dev/holidai/research/booking_matrix_turcja_kreta.csv`).
- Groups unique hotels to prevent redundant page loading, while stay-length URLs are fetched for price checking.
- Tracks and displays progress (e.g. `Progress: X/Y unique hotels verified`).

### Step 4.2: Scrape and Cache Iteration
The script loops through unique hotels, opens the URLs via Chrome Beta, runs the extraction JS asynchronously, and saves intermediate progress to the corresponding local json cache file.

---

## 5. Self-Review & Fixes

1. **Price Formats on Booking.com:** Cleaned via `/[^\d]/g` regex in JS to extract clean integers.
2. **Asynchronous Facility Loading:** Converted to an async JS function with a `1000ms` sleep after clicking the trigger anchor.
3. **Photo Extraction:** Grid image tags (`img.src` or `data-lazy` attributes) are scraped directly from the main layout.
4. **Resumability & Progress:** Progress checks local json cache keys before launching browser page requests, and displays a summary on startup.

---

## 6. Verification Plan

### Automated Checks
- Execute script from terminal:
  ```bash
  python3 /Users/krz/Dev/holidai/scrape/verify_matrix.py [/path/to/input.csv]
  ```

### Manual Verification
- Check generated markdown files folder.
- Inspect the discrepancies report.
- Spot check 3-5 rows in Chrome Beta against the generated CSV.
