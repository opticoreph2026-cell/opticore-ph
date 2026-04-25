# Feature 10: Statistical Water Leak Detection

## Overview
A statistical anomaly detection engine that identifies potential hidden water leaks in residential or commercial properties. It analyzes sequential water meter readings (m³ or gallons) and compares the rate of change against historical baselines and expected standard deviations.

## Routes
| Type | Path | Description |
|------|------|-------------|
| Algorithm | `src/lib/algorithms/waterAnalyzer.js` | Core anomaly detection engine |
| Invocation | `src/app/api/dashboard/readings/route.js` | Invoked after submitting a new reading |
| UI | `AlertsFeed.js` | Displays critical leak alerts to users |

## Key Files
- `src/lib/algorithms/waterAnalyzer.js` — Core statistical engine
- `src/app/api/dashboard/readings/route.js` — Triggers detection post-submission

## Algorithm Logic
```
1. Fetch past N water readings for the client
2. If less than 3 readings: return null (insufficient baseline)
3. Calculate moving averages and standard deviations of m³ consumption delta.
4. Calculate Z-Score of the newest reading.
     → Z = (Current_Usage - Mean_Usage) / Standard_Deviation
5. Thresholds:
     - Z > 2.5: Probable Leak (High Confidence)
     - Z > 1.5: Potential Leak (Medium Confidence)
6. If Leak Detected:
     → Generate System Alert (Severity: Critical or Warning based on Z-Score)
```

## When Alerts Fire
- **Critical (Z > 2.5)**: Immediate spike detected that strongly deviates from seasonal norms.
- **Warning (Z > 1.5)**: Elevated consumption that could indicate a slow leak.
- Only available for **Business** tier users.

## Error Reference
| Status | Meaning | Fix |
|--------|---------|-----|
| `insufficient_baseline` | Not enough readings (<3) | User needs to log more monthly water readings |
| `403 FORBIDDEN` | Starter/Pro plan user | Feature requires Business plan |

## How to Debug
1. Submit multiple water readings with standard variance (e.g. 10m³, 11m³, 10m³, 12m³).
2. Submit a massive spike (e.g. 30m³).
3. The detector should catch the anomaly and flag a critical alert in the dashboard.
