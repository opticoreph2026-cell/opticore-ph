# Feature 02: Dashboard Overview

## Overview
The main Energy Command Center — the first page users see after login. Displays KPI cards, consumption charts, and smart action widgets.

## Routes
| Type | Path | Description |
|------|------|-------------|
| Page | `/dashboard` | Main dashboard page |
| API | `GET /api/dashboard/data` | Fetches all data for dashboard widgets |
| API | `GET /api/dashboard/providers?type=electricity\|water` | Fetches utility provider lists |
| API | `GET /api/dashboard/grid-status` | Live Philippine grid status |

## Key Files
- `src/app/dashboard/page.js` — Main dashboard page (server component wrapper)
- `src/app/dashboard/layout.js` — Dashboard shell (loads Sidebar, Navbar)
- `src/components/dashboard/Overview.js` — KPI cards and chart rendering
- `src/components/dashboard/Sidebar.js` — Navigation sidebar
- `src/components/dashboard/GridStatusBanner.js` — Live grid alert banner

## Data Loaded
- Last 12 months of utility readings (kWh, m³, bill amounts)
- Latest AI report summary
- Unread alert count
- User profile and plan tier
- Active property info

## Chart Behavior
- **Group by Month**: Readings are grouped by `readingDate` month/year
- **Deduplication**: Multiple readings for the same month-year are merged (only the latest shows)
- Data points: last 6 months by default

## Error Reference
| HTTP | Error | Cause | Fix |
|------|-------|-------|-----|
| 500 | `Failed to fetch providers` | DB query on `UtilityProvider` table failing | Check DB connectivity, run `prisma db push` if table missing |
| 401 | Redirected to login | JWT cookie expired | Normal — re-login required |
| `Activity is not defined` | Dashboard crashes (JS ReferenceError) | Missing icon import in `Sidebar.js` | Add to lucide-react import list |

## Known Bugs Fixed
- ✅ `2026-04` — Charts showed duplicate bars for same month (fixed grouping logic in Overview.js)
- ✅ `2026-04` — `Activity is not defined` crash on all dashboard pages (fixed missing import in Sidebar.js)
- ✅ `2026-04` — 500 on `/api/dashboard/providers` due to DB connection failure (fixed LibSQL adapter init)

## How to Debug Quickly
1. Open browser **DevTools → Console** — look for the first red error
2. If `ReferenceError: X is not defined` → a component is using an icon/import that wasn't declared
3. If `500` on `/api/dashboard/data` or `/api/dashboard/providers` → DB issue, check env vars
4. If page is blank/white → check **DevTools → Network → XHR** for failed API calls
