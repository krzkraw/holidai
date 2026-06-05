# Holidai

This workspace collects vacation-planning artifacts for a September 2026 Mediterranean trip comparison and a Booking.com scraping workflow used to produce accommodation source data.

## Stack

- Static HTML reports in `gpt/` and `gemini/`.
- Markdown and CSV source material in `gpt/sources/`.
- Python 3 scripts in `booking-scraper-flow/scripts/`.
- `agent-browser` CLI for live Booking.com scraping.

No root package manifest, dependency lockfile, build system, test runner, or linter configuration was found.

## Setup

For static report review, no setup is required. Open the HTML files directly in a browser.

For the Booking.com scraper flow, install `agent-browser` and use Python 3:

```bash
npm install -g agent-browser
python3 --version
```

## Important Commands

Syntax-check the Python scripts without writing cache files into the workspace:

```bash
PYTHONPYCACHEPREFIX=/tmp/holidai-pycache python3 -m py_compile booking-scraper-flow/scripts/scrape_booking.py booking-scraper-flow/scripts/consolidate.py
```

Run the scraper against a file containing Booking.com links:

```bash
python3 booking-scraper-flow/scripts/scrape_booking.py <path-to-file-containing-booking-links>
```

Consolidate a generated Booking.com output directory:

```bash
python3 booking-scraper-flow/scripts/consolidate.py <path-to-booking-directory>
```

Review final report artifacts:

```text
gpt/ultimate-desktop.html
gpt/ultimate-mobile.html
gemini/system_por_wnawczy.html
gemini/wielkie_por_wnanie_r_dziemnomorskie_2026.html
```

## Project Structure

```text
.
|-- AGENTS.md
|-- README.md
|-- .gitignore
|-- booking-scraper-flow/
|   |-- AGENTS.md
|   |-- README.md
|   |-- SKILL.md
|   |-- scripts/
|   `-- examples/booking/
|-- gemini/
|   `-- *.html
`-- gpt/
    |-- AGENTS.md
    |-- README.md
    |-- MANIFEST.txt
    |-- ultimate-desktop.html
    |-- ultimate-mobile.html
    `-- sources/
```

## Repository Notes

The root workspace is not currently a git repository. The nested `booking-scraper-flow/` directory is its own git repository and was clean during bootstrap inspection.

If the root workspace should be versioned, initialize git only after explicit confirmation from the user.
