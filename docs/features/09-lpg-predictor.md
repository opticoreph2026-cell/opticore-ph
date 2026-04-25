# Feature 09: LPG Depletion Predictor

## Overview
A thermodynamics-based algorithm that predicts exactly when an LPG tank will run dry, based on historical burn rate or registered Gas Stove appliance data. Users can log LPG replacements from the Submit Reading modal.

## Routes
| Type | Path | Description |
|------|------|-------------|
| API | `POST /api/dashboard/lpg` | Log a new LPG tank replacement |
| Algorithm | `src/lib/algorithms/lpgPredictor.js` | Core prediction engine |
| UI | `SubmitReadingModal.js` (LPG section) | Optional fields at bottom of manual form |

## Key Files
- `src/app/api/dashboard/lpg/route.js` — LPG submission + intelligence trigger
- `src/lib/algorithms/lpgPredictor.js` — Core prediction engine

## Algorithm Logic
```
1. Fetch all LPG replacement history (ordered by date ASC)
2. If 0 records: return null
3. If ≥ 2 records:
     → Calculate actual daily burn rate from real depletion history
     → dailyBurnRateKg = totalDepletedKg / totalDays
4. If only 1 record:
     → Look for GasStove in user's appliances
     → Use thermal formula: kW × hoursPerDay × 0.072 kg/h × quantity
     → If no GasStove found: return status = 'insufficient_data'
5. Calculate:
     - daysSincePurchase = today - currentTank.replacementDate
     - kgBurnedSoFar = daysSincePurchase × dailyBurnRateKg
     - kgRemaining = tankSizeKg - kgBurnedSoFar
     - daysLeft = kgRemaining / dailyBurnRateKg
     - percentLeft = kgRemaining / tankSizeKg × 100
6. Return status: 'healthy' | 'warning' (≤15%) | 'critical' (0%)
```

## When Alerts Fire
- **Warning**: Tank is ≤ 15% full → amber alert in dashboard
- **Critical**: Tank is effectively empty → red alert
- Only fires for **Pro** and **Business** users

## Form Fields (in SubmitReadingModal)
| Field | Required | Notes |
|-------|----------|-------|
| `lpgKg` | ❌ (optional) | Tank size in kg (e.g., 11) |
| `lpgCost` | ❌ (optional) | Cost of refill in PHP |
| `replacementDate` | Auto | Uses same date as the reading |

## Error Reference
| Status | Meaning | Fix |
|--------|---------|-----|
| `insufficient_data` | Only 1 LPG record and no GasStove registered | Tell user to add GasStove in Appliances page |
| `empty` | Tank's `isEmpty` flag is true | Log a new tank replacement |
| `403 FORBIDDEN` | Starter plan user tried to log LPG | Upgrade to Pro |
| DB error | Turso connectivity issue | Check env vars; error is non-fatal |

## Known Bugs Fixed
- ✅ `2026-04` — `clientId` property name mismatch in `createAlert` call (fixed to `client_id`)

## How to Debug Quickly
1. Submit reading with LPG fields filled in
2. Check **Dashboard → Alerts** — if tank is below threshold, alert should appear
3. Check Vercel logs for `[LPG Forecaster] Non-fatal error:` messages
4. To test with low tank: submit a large `lpgKg` value with an old `replacementDate` (30+ days ago)
