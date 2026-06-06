# Phase 3: Sequential Page Enrichment

## Phase Goal

Fill the fixed `title -> content` enrichment bag in every serialized page JSON using sequential subagents, one bounded enrichment task at a time.

## Files To Inspect

- `AGENTS.md`
- `plans/booking-page-details/masterplan-booking-page-details.md`
- `plans/booking-page-details/phase-2-page-export.md`
- `scrape/**/*.md`
- `booking-model/pages/**/*.json`

## Files Likely To Modify

- `booking-model/pages/**/*.json`

## Exact Implementation Tasks

1. For each page JSON, dispatch one bounded subagent with exactly one markdown source file and one target JSON file.
2. In every handoff prompt, require the subagent to:
   - read the markdown dump
   - read the deterministic JSON
   - fill only the existing enrichment keys
   - leave deterministic fields untouched
   - avoid creating any new keys
3. Use this fixed enrichment schema in every JSON:
   - `Overall Impression`
   - `Location & Beach`
   - `Room Fit`
   - `Amenities & Comfort`
   - `Laundry Verdict`
   - `Guest Sentiment`
   - `Tradeoffs`
   - `Best For`
4. Include these prompt rules:
   - each value is a concise user-facing paragraph
   - ground text in both the markdown and the deterministic model
   - mention missing data explicitly when it affects interpretation
   - no speculation beyond reasonable inference
   - no bullet lists inside values
5. After each subagent run, the supervisor reviews the JSON diff before accepting it.
6. Continue sequentially until all JSON files under `booking-model/pages/` are enriched.

## Acceptance Criteria

- Every JSON under `booking-model/pages/` has all fixed enrichment keys populated with non-empty strings unless the page is so blocked that a key must explicitly note missing evidence.
- No deterministic JSON fields are changed during enrichment.
- Enrichment work is completed sequentially, with supervisor review between subagent runs.

## Verification Commands

- `rg -n '"enrichments"' booking-model/pages`
- Spot-check complete and blocked page JSON files manually

## Risks

- Freeform enrichment drift is the main risk; fixed keys and strict prompt guidance are mandatory.
- Sequential execution is slower, but required by the root workflow and by the need for supervisor review.

## Status

- `planned`
