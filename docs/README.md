# OptiCore PH — Feature Documentation Index

> **Version**: 1.0 | **Last Updated**: April 2026
> This is the master index of all OptiCore PH features, their API routes, components, and known error patterns.

---

## 🗂️ Feature Map

| # | Feature | Page Route | API Route | Status |
|---|---------|-----------|-----------|--------|
| 1 | [Authentication System](./features/01-authentication.md) | `/login`, `/signup` | `/api/auth/*` | ✅ Stable |
| 2 | [Dashboard Overview](./features/02-dashboard-overview.md) | `/dashboard` | `/api/dashboard/data` | ✅ Stable |
| 3 | [Reading Submission & AI Report](./features/03-reading-submission.md) | `/dashboard` | `/api/dashboard/readings` | ✅ Stable |
| 4 | [Neural Bill Scanner](./features/04-neural-bill-scanner.md) | `/dashboard` (modal) | `/api/ai/scan` | ✅ Stable |
| 5 | [AI Savings Reports](./features/05-ai-reports.md) | `/dashboard/reports` | `/api/dashboard/readings` | ✅ Stable |
| 6 | [Appliance Manager](./features/06-appliance-manager.md) | `/dashboard/appliances` | `/api/dashboard/appliances` | ✅ Stable |
| 7 | [Ghost Load Attribution Engine](./features/07-ghost-load-attribution.md) | Auto (on submit) | Internal (`/api/dashboard/readings`) | ✅ Stable |
| 8 | [Water Leak Detector](./features/08-water-leak-detector.md) | Auto (on submit) | Internal (`src/lib/algorithms/waterAnalyzer.js`) | ✅ Stable |
| 9 | [LPG Depletion Predictor](./features/09-lpg-predictor.md) | `/dashboard` (modal) | `/api/dashboard/lpg` | ✅ Stable |
| 10 | [Energy Certificates](./features/10-energy-certificates.md) | `/dashboard/certification` | `/api/dashboard/certification` | ✅ Stable |
| 11 | [ROI Simulator](./features/11-roi-simulator.md) | `/dashboard/roi-simulator` | `/api/ai/roi-simulator` | ✅ Stable |
| 12 | [Predictive Forecast](./features/12-predictive-forecast.md) | `/dashboard/forecast` | `/api/dashboard/forecast` | ✅ Stable |
| 13 | [Acoustic Auditor](./features/13-acoustic-auditor.md) | `/dashboard/acoustic-scan` | `/api/ai/acoustic` | ✅ Stable |
| 14 | [System Alerts](./features/14-system-alerts.md) | `/dashboard/alerts` | Internal | ✅ Stable |
| 15 | [Account Settings](./features/15-account-settings.md) | `/dashboard/settings` | `/api/dashboard/profile` | ✅ Stable |
| 16 | [Admin Panel](./features/16-admin-panel.md) | `/admin` | `/api/admin/*` | ✅ Stable |
| 17 | [PayMongo Billing](./features/17-paymongo-billing.md) | `/pricing` | `/api/checkout` | ✅ Stable |
| 18 | [Email Notifications](./features/18-email-notifications.md) | Auto-triggered | Internal (`src/lib/email.js`) | ✅ Stable |
| 19 | [Grid Status Banner](./features/19-grid-status-banner.md) | `/dashboard` (widget) | `/api/dashboard/grid-status` | ✅ Stable |
| 20 | [Daily Meter Tracker](./features/20-daily-meter-tracker.md) | `/dashboard` (widget) | `/api/dashboard/daily-readings` | ✅ Stable |

---

## 🐛 Bug Tracking Strategy

See [BUG_TRACKING.md](./BUG_TRACKING.md) for the complete guide on how to find, log, and resolve bugs quickly in OptiCore PH.

---

## 🏗️ System Architecture Summary

```
src/
├── app/
│   ├── api/              # All backend API routes (Next.js Route Handlers)
│   │   ├── ai/           # Gemini AI features (scan, acoustic, roi-simulator)
│   │   ├── auth/         # Login, signup, logout, refresh, me
│   │   ├── dashboard/    # All data APIs (readings, appliances, lpg, etc.)
│   │   └── admin/        # Admin-only management endpoints
│   ├── dashboard/        # Frontend pages (all protected)
│   ├── admin/            # Admin frontend page
│   └── (public)/         # login, signup, pricing, onboarding
├── components/
│   └── dashboard/        # Reusable UI components
├── lib/
│   ├── db.js             # Database engine (Turso + Prisma)
│   ├── auth.js           # JWT authentication helpers
│   ├── email.js          # Nodemailer / transactional email
│   ├── algorithms/       # Deterministic intelligence engines
│   │   ├── waterAnalyzer.js
│   │   ├── lpgPredictor.js
│   │   └── providerAggregator.js
│   └── ratelimit.js      # In-memory rate limiter
├── utils/
│   └── attributionEngine.js  # Ghost load calculator
└── middleware.js         # JWT route protection
```
