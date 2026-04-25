# Feature 08: Water Leak Detector

## Overview
A deterministic (zero AI cost) algorithm that automatically runs every time a reading is submitted. It uses 90-day trailing statistical averages and Standard Deviation (σ) analysis to detect invisible household leaks (toilets, underground pipes).

## Routes
| Type | Path | Description |
|------|------|-------------|
| Internal | Triggered in `POST /api/dashboard/readings` | No standalone endpoint |
| Algorithm | `src/lib/algorithms/waterAnalyzer.js` | Core logic |

## Key Files
- `src/lib/algorithms/waterAnalyzer.js` — Full implementation
- `src/app/api/dashboard/readings/route.js` — Trigger point (line ~207)

## Algorithm Logic
```
1. Fetch last 4 water readings (current + 3 historical)
2. If < 2 readings: return null (insufficient data)
3. Calculate 90-day average (avgHistorical)
4. Calculate Standard Deviation (stdDev)
5. Dynamic threshold = max(avg + 1.25σ, avg × 1.10)
6. If currentReading.m3Used > threshold:
     a. Check if user logged any new WaterFixture in last 30 days
     b. If NO new fixture: fire Critical Alert in DB
     c. If YES new fixture: explained spike, no alert
7. Return { hasLeak: bool, jump: percentageJump }
```

## When It Fires
- Only for **Pro** and **Business** plan users
- Only when `m3Used > 0` in the submitted reading
- Only when there are at least **2 previous water readings** to compare against

## Alert Generated
```json
{
  "title": "Critical Water Spike Detected",
  "severity": "critical",
  "message": "Water consumption spiked by X% (Y m³) compared to your average Without any new fixtures logged..."
}
```

## Error Reference
| Error | Cause | Fix |
|-------|-------|-----|
| Algorithm silently returns `null` | < 2 water readings in history | Normal — need more data points |
| Alert not firing | User has `WaterFixture` appliance added recently | Normal behavior — fixture explains the spike |
| DB error in algorithm | Turso connection issue | Check DB env vars; error is non-fatal (caught internally) |

## Known Bugs Fixed
- ✅ `2026-04` — Previous implementation used a hard-coded `m3 > 50` threshold (replaced with real statistical analysis)

## How to Debug Quickly
1. Add a test reading with `m3Used` that is 30%+ higher than previous readings
2. Check **Dashboard → Alerts** — a "Critical Water Spike" alert should appear within seconds
3. If no alert: check Vercel function logs for `[Water Analyzer Error]` messages
4. Verify user plan is not `starter` (starter plan skips this check)
