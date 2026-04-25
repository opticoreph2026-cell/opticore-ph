# Feature 03: Reading Submission & AI Report

## Overview
The core feature of OptiCore PH. Users submit their monthly utility bill data (manually or via AI scan), which triggers a full AI analysis by Gemini and stores the reading + report in the database. Also fires Ghost Load detection, Water Leak analysis, and spike alerts.

## Routes
| Type | Path | Description |
|------|------|-------------|
| Component | `SubmitReadingModal.js` | The UI modal for data entry |
| API | `POST /api/dashboard/readings` | Processes reading, calls Gemini, saves to DB |

## Key Files
- `src/components/dashboard/SubmitReadingModal.js` — UI modal (manual entry + file upload modes)
- `src/app/api/dashboard/readings/route.js` — Main submission handler

## Submission Flow
```
User Submits Form
  ↓
1. Duplicate Check (same readingDate already exists?)
  ↓
2. Fetch user profile + appliances
  ↓
3. Build AI prompt → Send to Gemini 1.5 Flash
  ↓
4. Parse AI response (SUMMARY / RECOMMENDATIONS / ESTIMATED_SAVINGS)
  ↓
5. Save UtilityReading to DB
  ↓
6. Save AIReport to DB
  ↓
7. Run Ghost Load Attribution Engine (Pro/Business)
  ↓
8. Run Water Leak Detector (Pro/Business)
  ↓
9. Check month-over-month spike (>20% = warning alert)
  ↓
10. Check effective rate (>₱16/kWh = alert)
  ↓
11. Send Monthly Digest Email (Pro/Business)
  ↓
Return success
```

## Form Fields
| Field | Required | Notes |
|-------|----------|-------|
| `readingDate` | ✅ | YYYY-MM-DD format |
| `kwhUsed` | ✅ | kWh consumed this month |
| `billAmountElectric` | ✅ | Total electricity bill in PHP |
| `m3Used` | ❌ | Water consumption in cubic meters |
| `billAmountWater` | ❌ | Water bill in PHP |
| `lpgKg` | ❌ | LPG tank size if replaced this month |
| `lpgCost` | ❌ | LPG refill cost in PHP |

## Error Reference
| HTTP | Error | Cause | Fix |
|------|-------|-------|-----|
| 409 | `DUPLICATE_ENTRY` | Reading for this date already exists | Delete old reading or pick different date |
| 400 | `Missing required reading parameters` | `readingDate`, `kwhUsed`, or `billAmountElectric` is empty | Ensure all required fields are filled |
| 500 | `Internal Server Error` | Gemini API call failed or DB write failed | Check `GEMINI_API_KEY`, check DB connectivity |
| 401 | `Unauthorized` | User session expired | Re-login |

## Known Bugs Fixed
- ✅ `2026-04` — Duplicate readings for same month appeared in charts (fixed duplicate check on line 30-40)

## How to Debug Quickly
1. Open **DevTools → Network** → click the failed `POST /api/dashboard/readings` request
2. Check the **Response** body for the `error` field
3. If `DUPLICATE_ENTRY` → expected behavior
4. If Gemini-related error → check `GEMINI_API_KEY` in Vercel env vars
5. If DB error → check Turso env vars
