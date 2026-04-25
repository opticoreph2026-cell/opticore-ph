# Feature 07: Ghost Load Attribution Engine

## Overview
A deterministic algorithm that compares a user's declared appliance consumption (calculated from wattage × hours/day × quantity) against their actual billed kWh. Any unexplained gap is classified as a "ghost load" — energy that is being consumed but not accounted for by known appliances.

## Routes
| Type | Path | Description |
|------|------|-------------|
| Internal | Triggered in `POST /api/dashboard/readings` | No standalone endpoint |
| Utility | `src/utils/attributionEngine.js` | Core ghost load calculator |

## Key Files
- `src/utils/attributionEngine.js` — Core logic
- `src/app/api/dashboard/readings/route.js` — Trigger point (line ~143)

## Algorithm Logic
```
1. Sum all appliance theoretical consumption:
   totalTheoretical = Σ (wattage / 1000) × hoursPerDay × 30 × quantity (kWh/month)
2. discrepancy = actualKwh - totalTheoretical
3. discrepancyPct = (discrepancy / actualKwh) × 100
4. Classification:
   - discrepancyPct > 40% → severity: CRITICAL  → fires critical alert
   - discrepancyPct > 20% → severity: LEAKING   → fires warning alert
   - else → severity: NORMAL
```

## When It Fires
- Only for **Pro** and **Business** users
- Only when user has at least 1 appliance registered
- Only when `kwhUsed > 0`

## Alerts Generated
| Severity | Title | When |
|----------|-------|------|
| `critical` | 🚨 Critical Ghost Load Detected | >40% unaccounted |
| `warning` | ⚠️ Elevated Ghost Load | 20-40% unaccounted |

## Error Reference
| Error | Cause | Fix |
|-------|-------|-----|
| No alert despite high usage | User has no appliances registered | Tell user to add appliances in `/dashboard/appliances` |
| Alert fires constantly | Appliance wattage/hours are not configured | Have user update appliance data |
| Algorithm crashes | Error in `calculateAttribution` | Check `src/utils/attributionEngine.js` for logic bugs |

## How to Debug Quickly
1. Register an appliance with low wattage and submit a high kWh reading (e.g., appliance: 100W, reading: 500 kWh)
2. A ghost load alert should appear in **Dashboard → Alerts**
3. If no alert: confirm user plan is `pro` or `business` and has at least 1 appliance registered
4. Check Vercel logs for `[Anomaly Engine] Non-fatal error:` messages
