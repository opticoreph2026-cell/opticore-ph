# PHASE_0_AUDIT.md
> Generated: 2026-05-01 · OptiCore PH · Read-only audit pass. No code modified.

---

## 1. API Route Inventory — Active vs. Orphaned

All routes live under `src/app/api/`. Legend: ✅ Active | ⚠️ Suspect | 🗑️ Orphaned

### `/api/auth/` (8 routes)

| Route | File | Status | Notes |
|---|---|---|---|
| `POST /api/auth/signup` | `auth/signup/route.js` | ✅ Active | Core signup flow |
| `POST /api/auth/login` | `auth/login/route.js` | ✅ Active | Core login flow |
| `POST /api/auth/logout` | `auth/logout/route.js` | ✅ Active | Clears cookies |
| `GET /api/auth/me` | `auth/me/route.js` | ✅ Active | Used by middleware + dashboard |
| `POST /api/auth/refresh` | `auth/refresh/route.js` | ✅ Active | JWT refresh, used by `middleware.js` (falls back to `JWT_REFRESH_SECRET || JWT_SECRET`) |
| `POST /api/auth/forgot-password` | `auth/forgot-password/route.js` | ✅ Active | OTP email flow |
| `POST /api/auth/change-password` | `auth/change-password/route.js` | ✅ Active | Settings page |
| `DELETE /api/auth/delete-account` | `auth/delete-account/route.js` | ✅ Active | Destructive action route |

> **Note:** `.env` declares `GOOGLE_CLIENT_ID` / `GOOGLE_REDIRECT_URI` for Google OAuth, but **no** `src/app/api/auth/google/` route exists. No consumer found in `src/`. These env vars are declared but have no live handler.

---

### `/api/dashboard/` (15 routes)

| Route | File | Status | Notes |
|---|---|---|---|
| `GET/POST /api/dashboard/readings` | `dashboard/readings/route.js` (12.6 KB) | ✅ Active | Core bill CRUD; uses Gemini for provider detection |
| `GET /api/dashboard/data` | `dashboard/data/route.js` (9.7 KB) | ✅ Active | Main dashboard KPI feed |
| `GET/POST /api/dashboard/alerts` | `dashboard/alerts/route.js` (2.6 KB) | ✅ Active | Alert feed |
| `GET/POST /api/dashboard/appliances` | `dashboard/appliances/route.js` (5.1 KB) | ✅ Active | User appliance list |
| `GET/PUT /api/dashboard/profile` | `dashboard/profile/route.js` (1.9 KB) | ✅ Active | Profile page |
| `GET /api/dashboard/providers` | `dashboard/providers/route.js` (0.7 KB) | ✅ Active | Utility provider list |
| `GET/POST /api/dashboard/properties` | `dashboard/properties/route.js` (2.0 KB) | ✅ Active | Multi-property support |
| `PATCH/DELETE /api/dashboard/properties/[id]` | `dashboard/properties/[id]/route.js` (1.2 KB) | ✅ Active | Property edit/delete |
| `GET /api/dashboard/grid-status` | `dashboard/grid-status/route.js` (1.5 KB) | ⚠️ Suspect | References `process.env.FEATURE_DEMO_MODE` — var **not declared** in either `.env` or `.env.local`. Random demo logic is a non-deterministic runtime risk. |
| `GET /api/dashboard/forecast` | `dashboard/forecast/route.js` (2.9 KB) | ⚠️ Suspect | No direct UI consumer found via grep. Confirm if `ForecastCard` or similar calls this. |
| `GET /api/dashboard/export/csv` | `dashboard/export/csv/route.js` (1.5 KB) | ⚠️ Suspect | No nav link or fetch caller found in `src/`. May be directly linked (download href) but unverified. |
| `GET /api/dashboard/attribution` | `dashboard/attribution/route.js` (2.1 KB) | ⚠️ Suspect | No UI consumer found via grep. |
| `GET /api/dashboard/certification` | `dashboard/certification/route.js` (4.0 KB) | ⚠️ Suspect | No UI consumer found via grep. |
| `GET/POST /api/dashboard/daily-readings` | `dashboard/daily-readings/route.js` (4.3 KB) | 🗑️ **ORPHANED** | Backed by `DailyMeterReading` (slated for deletion). Zero callers found in `src/`. |
| `GET/POST /api/dashboard/lpg` | `dashboard/lpg/route.js` (5.0 KB) | 🗑️ **ORPHANED** | Backed by `LPGReading` (slated for deletion). Zero callers found in `src/`. |
| `GET /api/dashboard/catalog` | `dashboard/catalog/route.js` (1.0 KB) | 🗑️ **ORPHANED** | Backed by `ApplianceCatalog` (slated for deletion). No fetch callers found. Page is feature-gated (`FEATURE_APPLIANCE_CATALOG=false`). |

---

### `/api/ai/` (4 routes)

| Route | File | Status | Notes |
|---|---|---|---|
| `POST /api/ai/parse-bill` | `ai/parse-bill/route.js` (9.1 KB) | ✅ Active | Multimodal Gemini bill scan, core feature |
| `POST /api/ai/scan` | `ai/scan/route.js` (10.5 KB) | ✅ Active | AI analysis scan, uses Gemini |
| `POST /api/ai/roi-simulator` | `ai/roi-simulator/route.js` (10.0 KB) | ✅ Active | Solar/efficiency ROI calculator |
| `POST /api/ai/acoustic` | `ai/acoustic/route.js` (3.7 KB) | 🗑️ **ORPHANED** | Acoustic AI scan feature. Has dedicated page (`acoustic-scan/page.js`) and component (`AcousticAuditor.js`) but **no nav link** found anywhere. Referenced in `AdminNotificationBell.js` / `AdminNotificationFeed.js` as a notification type only. |

---

### `/api/admin/` (6 routes)

| Route | File | Status | Notes |
|---|---|---|---|
| `GET /api/admin/clients` | `admin/clients/route.js` (0.7 KB) | ✅ Active | Admin client list |
| `GET/PATCH /api/admin/clients/[id]` | `admin/clients/[id]/route.js` (1.4 KB) | ✅ Active | Client detail/edit |
| `PATCH /api/admin/clients/[id]/plan` | `admin/clients/[id]/plan/route.js` | ✅ Active | Plan upgrade override |
| `GET/POST /api/admin/providers` | `admin/providers/route.js` (2.7 KB) | ✅ Active | Provider management |
| `GET /api/admin/notifications` | `admin/notifications/route.js` (1.6 KB) | ✅ Active | Admin notification feed |
| `POST /api/admin/aggregate-rates` | `admin/aggregate-rates/route.js` (1.1 KB) | ✅ Active | Cron-protected rate aggregation job; uses `ADMIN_CRON_SECRET` |
| `POST /api/admin/upgrade` | `admin/upgrade/route.js` (1.3 KB) | ✅ Active | Manual plan upgrade |
| `POST /api/admin/catalog/upload` | `admin/catalog/upload/route.js` (3.8 KB) | 🗑️ **ORPHANED** | Uploads to `ApplianceCatalog` (slated for deletion). |

---

### `/api/checkout/`, `/api/report/`, `/api/webhooks/` (3 routes)

| Route | File | Status | Notes |
|---|---|---|---|
| `POST /api/checkout` | `checkout/route.js` (2.4 KB) | ✅ Active | PayMongo session creation |
| `GET /api/report` | `report/route.ts` (4.9 KB) | ✅ Active | AI report generation (TypeScript) |
| `POST /api/webhooks/paymongo` | `webhooks/paymongo/route.js` (2.9 KB) | ✅ Active | PayMongo event handler |

---

## 2. Prisma Schema — Model Inventory

Schema file: `prisma/schema.prisma` (301 lines, Prisma 6.2.1)
Datasource: `sqlite` → `env("DATABASE_URL")` (production overridden to LibSQL/Turso via `db.js`)

| Model | Own Fields | Relations (out) | Status | Notes |
|---|---|---|---|---|
| `Client` | 19 | 10 | ✅ Keep | Core user model. Has `dailyReadings` + `lpgReadings` relations pointing to deletion targets. |
| `Property` | 7 | 5 | ✅ Keep | Has `lpgReadings` relation pointing to deletion target. |
| `UtilityProvider` | 9 | 0 | ✅ Keep | No relations, standalone lookup. |
| `UtilityReading` | 17 | 2 | ✅ Keep | Core bill data. Has `Float` on money fields — see violation note below. |
| `AIReport` | 9 | 2 | ✅ Keep | AI report output. `estimatedSavings Float` — see violation note. |
| `Alert` | 7 | 1 | ✅ Keep | Notification model. |
| `Appliance` | 11 | 2 | ✅ Keep | User's personal appliance list (distinct from `ApplianceCatalog`). |
| `VerificationToken` | 5 | 0 | ✅ Keep | OTP tokens. |
| `Transaction` | 7 | 1 | ✅ Keep | PayMongo transaction log. `amount Float` — see violation note. |
| `RefreshToken` | 5 | 1 | ✅ Keep | JWT refresh token store. |
| `AdminNotification` | 6 | 0 | ✅ Keep | Admin bell system. `type` field includes `'acoustic'` in comment — tie to deletion target. |
| `DailyMeterReading` | 6 | 1 | 🗑️ **DELETE** | `date String` (violates DateTime rule). Zero `src/` callers. |
| `ApplianceCatalog` | 12 | 0 | 🗑️ **DELETE** | Standalone catalog. Uses `enum ApplianceCategory` (also deletes with it). |
| `LPGReading` | 8 | 2 | 🗑️ **DELETE** | `replacementDate String` (violates DateTime rule). Zero `src/` callers. |

**Enum to delete:** `ApplianceCategory` (only referenced by `ApplianceCatalog`).

### Money Field Violations (Non-Negotiable Rule)
These existing fields use `Float` instead of `Decimal(10,2)`:

| Model | Field | Current Type |
|---|---|---|
| `UtilityProvider` | `baseRate`, `benchmarkAvg` | `Float` |
| `UtilityReading` | `kwhUsed`, `m3Used`, `billAmountElectric`, `billAmountWater`, `generationCharge`, `transmissionCharge`, `systemLoss`, `distributionCharge`, `subsidies`, `governmentTax`, `vat`, `otherCharges`, `effectiveRate`, `potentialSavings` | `Float` / `Float?` |
| `AIReport` | `estimatedSavings`, `potentialSavings` | `Float` |
| `Appliance` | `wattage`, `hoursPerDay` | `Float?` |
| `ApplianceCatalog` | `wattage`, `coolingCapacityKjH`, `eerRating`, `estimatedPricePhp` | `Float` (deletion target) |
| `LPGReading` | `tankSizeKg`, `costPhp` | `Float` (deletion target) |
| `Transaction` | `amount` | `Float` |

> ⚠️ SQLite (and LibSQL/Turso) does **not** support `Decimal` natively — Prisma maps `Decimal` to `REAL`/`TEXT` depending on adapter. Consider `String`-stored Decimal or application-level coercion if strict precision is required.

---

## 3. Files Referencing Deletion-Target Models

### `DailyMeterReading`

| File | Line(s) | Type |
|---|---|---|
| `prisma/schema.prisma` | L39, L198 | Schema definition + `Client` relation |
| `prisma/sync-turso.js` | L103 | Index DDL for Turso sync script |

**Result:** Zero references in `src/`. Safe to delete route + model together.

---

### `LPGReading`

| File | Line(s) | Type |
|---|---|---|
| `prisma/schema.prisma` | L40, L62, L240 | Schema definition + `Client`/`Property` relations |

**Result:** Zero references in `src/`. Safe to delete route + model together.

---

### `ApplianceCatalog`

| File | Line(s) | Type |
|---|---|---|
| `prisma/schema.prisma` | L222 | Schema definition |
| `src/scripts/debug-catalog.js` | L13, L18 | Debug script only — references count + error string |
| `src/components/dashboard/ApplianceCatalogClient.tsx` | L20 | Component (misleading name — actually renders `Appliance[]`, not `ApplianceCatalog`) |
| `src/app/dashboard/catalog/page.js` | L4, L41 | Page that imports `ApplianceCatalogClient`; feature-gated by `FEATURE_APPLIANCE_CATALOG=false` |

> **Important distinction:** `ApplianceCatalogClient.tsx` takes `initialCatalog: Appliance[]` (the user's personal `Appliance` model), **not** the `ApplianceCatalog` master table. The component name is misleading but the underlying data model it queries is `Appliance` (a keep target). The `ApplianceCatalog` DB model itself has zero live query callers in `src/`.

---

## 4. NGCP Grid Monitoring & Acoustic AI Scan References

### NGCP Grid Monitoring

| File | Line | Content |
|---|---|---|
| `src/components/dashboard/GridStatusBanner.js` | L10 | JSDoc comment: *"Translates complex NGCP grid data..."* |
| `src/components/dashboard/GridStatusBanner.js` | L73 | UI label: `"Source: NGCP Public Feed"` |

**Assessment:** These are **copy strings only** — no API calls to any external NGCP feed. The actual data source is the internal `grid-status` route (which returns static/demo data). The "NGCP" branding is cosmetic and misleading.

---

### Acoustic AI Scan

| File | Line(s) | Type |
|---|---|---|
| `src/app/api/ai/acoustic/route.js` | L5, L19, L35, L86 | API route implementation (Gemini-powered) |
| `src/app/dashboard/acoustic-scan/page.js` | L3, L6, L8, L17, L27 | Dedicated dashboard page |
| `src/components/dashboard/AcousticAuditor.js` | L6, L67, L113, L142 | UI component; calls `/api/ai/acoustic` |
| `src/components/admin/AdminNotificationFeed.js` | L13 | Notification type icon mapping (`acoustic`) |
| `src/components/admin/AdminNotificationBell.js` | L14 | Notification type label (`acoustic: 'Acoustic Scan'`) |

**Assessment:** Full stack exists (route → component → page) but **zero navigation links** point to `/dashboard/acoustic-scan`. It is a dead-end page. The `AdminNotification` model's `type` column comment also lists `acoustic` as a valid type string.

---

## 5. `prisma validate` Result

**Command:** `node_modules\.bin\prisma validate` (run via `cmd /c`)

```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma

Error: Prisma schema validation - (get-config wasm)
Error code: P1012
error: Error validating datasource `db`: the URL must start with the protocol `file:`
  --> prisma\schema.prisma:8
  |
7 |   provider = "sqlite"
8 |   url      = env("DATABASE_URL")
  |

Validation Error Count: 1
```

**Root cause:** `.env` sets `DATABASE_URL=libsql://opticoreph-...turso.io` (a LibSQL URL for Turso). The schema declares `provider = "sqlite"`, which expects a `file:` protocol. This is intentional — `src/lib/db.js` overrides `DATABASE_URL` at runtime to `file:./dev.db` for local dev and uses the LibSQL adapter for production. However, Prisma's static validator reads `.env` directly and sees the mismatch.

**Impact:** `prisma validate` always fails. `prisma migrate` and `prisma generate` are blocked unless `DATABASE_URL` is temporarily set to `file:./dev.db` (done via `.env.local` override in dev). This is a **known fragile pattern** — the schema provider should ideally match or use `driverAdapters` preview feature properly.

---

## 6. Environment Variable Audit

### `.env` Declared Variables (41 lines, 19 vars)

| Variable | Used In Code | Location |
|---|---|---|
| `JWT_SECRET` | ✅ Yes | `src/lib/auth.js`, `src/middleware.js` |
| `JWT_REFRESH_SECRET` | ✅ Yes | `src/lib/auth.js`, `src/middleware.js` |
| `ADMIN_CRON_SECRET` | ✅ Yes | `src/app/api/admin/aggregate-rates/route.js` |
| `BCRYPT_ROUNDS` | ✅ Yes | `src/lib/auth.js` |
| `NEXTAUTH_SECRET` | ❌ Not found in `src/` | Declared but no NextAuth library installed |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | ✅ Yes | `src/components/ui/Captcha.js` |
| `TURNSTILE_SECRET_KEY` | ✅ Yes | `src/lib/security.js` |
| `DATABASE_URL` | ✅ Yes | `src/lib/db.js` (runtime override) |
| `TURSO_DATABASE_URL` | ✅ Yes | `src/lib/db.js` |
| `TURSO_AUTH_TOKEN` | ✅ Yes | `src/lib/db.js` |
| `GEMINI_API_KEY` | ✅ Yes | Multiple API routes |
| `GROQ_API_KEY` | ❌ Not found in `src/` | Declared, zero usage — **orphaned** |
| `OPENROUTER_API_KEY` | ❌ Not found in `src/` | Declared, zero usage — **orphaned** |
| `GMAIL_USER` | ✅ Yes | `src/lib/email.js` |
| `GMAIL_APP_PASSWORD` | ✅ Declared | Used only as SMTP fallback; active path uses OAuth2 |
| `GMAIL_CLIENT_ID` | ✅ Yes | `src/lib/email.js` |
| `GMAIL_CLIENT_SECRET` | ✅ Yes | `src/lib/email.js` |
| `GMAIL_REFRESH_TOKEN` | ✅ Yes | `src/lib/email.js` |
| `GMAIL_REDIRECT_URI` | ✅ Yes | `src/lib/email.js` |
| `GOOGLE_CLIENT_ID` | ❌ Not found in `src/` | Declared for Google Sign-In — **no route handler exists** |
| `GOOGLE_CLIENT_SECRET` | ❌ Not found in `src/` | Same as above — **orphaned** |
| `GOOGLE_REDIRECT_URI` | ❌ Not found in `src/` | Same as above — **orphaned** |
| `PAYMONGO_SECRET_KEY` | ✅ Yes | `src/lib/paymongo.js`, `src/app/api/checkout/route.js` |
| `PAYMONGO_PUBLIC_KEY` | ✅ Declared | Likely used client-side via `NEXT_PUBLIC_` but missing prefix |
| `PAYMONGO_WEBHOOK_SECRET` | ✅ Yes | `src/lib/paymongo.js` |

---

### `.env.local` Declared Variables (27 lines)

| Variable | Status | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ Active | Overrides `.env` for local dev → `file:./dev.db` |
| `GEMINI_API_KEY` | ✅ Active | Local dev key (different from `.env`) |
| `GMAIL_APP_PASSWORD` | ✅ Declared | Overrides `.env` value with placeholder `xxxx` |
| `GMAIL_CLIENT_ID` | ✅ Active | Matches `.env` |
| `GMAIL_CLIENT_SECRET` | ✅ Active | Matches `.env` |
| `GMAIL_REDIRECT_URI` | ✅ Active | Matches `.env` |
| `GMAIL_REFRESH_TOKEN` | ✅ Active | Matches `.env` |
| `GMAIL_USER` | ✅ Active | Matches `.env` |
| `JWT_SECRET` | ✅ Active | Local placeholder value |
| `NEXTAUTH_SECRET` | ❌ No consumer | Carried over from scaffold, unused |
| `NEXTAUTH_URL` | ❌ No consumer | Carried over from scaffold, unused |
| `NEXT_PUBLIC_APP_URL` | ✅ Active | `src/lib/email.js` |
| `NODE_ENV` | ✅ Active | `src/lib/auth.js`, error pages |
| `PAYMONGO_PUBLIC_KEY` | ⚠️ Missing prefix | Should be `NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY` to be readable client-side |
| `PAYMONGO_SECRET_KEY` | ✅ Active | Server-side only, correct |
| `PAYMONGO_WEBHOOK_SECRET` | ✅ Active | Webhook validation |
| `TURSO_AUTH_TOKEN` | ✅ Active | `src/lib/db.js` |
| `TURSO_DATABASE_URL` | ✅ Active | `src/lib/db.js` |
| `VERCEL_OIDC_TOKEN` | ❌ No consumer | Auto-injected by Vercel CLI, not used in code |
| `GEMINI_NARRATIVE_MAX_TOKENS` | ❌ No consumer | Declared, zero usage in `src/` |
| `FEATURE_SMART_METER_BETA` | ❌ No consumer | Declared, zero usage in `src/` |
| `FEATURE_LPG_TRACKING` | ✅ Active | `src/app/dashboard/page.js` L65 |
| `FEATURE_SME_AUDIT` | ❌ No consumer | Declared, zero usage in `src/` |
| `FEATURE_APPLIANCE_CATALOG` | ✅ Active | `src/app/dashboard/catalog/page.js` L13 |
| `FEATURE_DEMO_MODE` | ⚠️ Undeclared | Used in `grid-status/route.js` but **not in either env file** |

---

### Variables in `.env` with No Consumer (Orphaned)

| Variable | Reason |
|---|---|
| `GROQ_API_KEY` | No usage in `src/`. Leftover from pre-Gemini era. |
| `OPENROUTER_API_KEY` | No usage in `src/`. Leftover from pre-Gemini era. |
| `NEXTAUTH_SECRET` | Next-auth not installed. Scaffold remnant. |
| `GOOGLE_CLIENT_ID` | Google Sign-In route (`/api/auth/google/callback`) does not exist. |
| `GOOGLE_CLIENT_SECRET` | Same as above. |
| `GOOGLE_REDIRECT_URI` | Same as above. |

### Variables Used in Code But Not Declared

| Variable | Used In | Missing From |
|---|---|---|
| `FEATURE_DEMO_MODE` | `src/app/api/dashboard/grid-status/route.js` | Both `.env` and `.env.local` |
| `NEXT_PUBLIC_POSTHOG_KEY` | `src/components/providers/PostHogProvider.js` | Both `.env` and `.env.local` |
| `NEXT_PUBLIC_POSTHOG_HOST` | `src/components/providers/PostHogProvider.js` | Both `.env` and `.env.local` (has fallback `'https://us.i.posthog.com'`) |

---

## Summary — Delete Manifest

### Schema (prisma/schema.prisma)
- **Remove models:** `DailyMeterReading`, `LPGReading`, `ApplianceCatalog`
- **Remove enum:** `ApplianceCategory`
- **Remove relations from `Client`:** `dailyReadings`, `lpgReadings`
- **Remove relation from `Property`:** `lpgReadings`

### API Routes (full directory delete)
- `src/app/api/dashboard/daily-readings/` — orphaned, backed by deletion target
- `src/app/api/dashboard/lpg/` — orphaned, backed by deletion target
- `src/app/api/dashboard/catalog/` — orphaned, backed by deletion target
- `src/app/api/admin/catalog/` — orphaned, backed by deletion target
- `src/app/api/ai/acoustic/` — feature never linked, no nav entry

### UI Pages & Components
- `src/app/dashboard/acoustic-scan/` — dead-end page
- `src/components/dashboard/AcousticAuditor.js` — only consumer of acoustic route
- `src/scripts/debug-catalog.js` — debug script for deletion-target model

### Environment Variables (clean up `.env`)
- **Remove:** `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- **Declare:** `FEATURE_DEMO_MODE=false` (or remove its usage from grid-status route)
- **Undeclare:** `FEATURE_SMART_METER_BETA`, `FEATURE_SME_AUDIT`, `GEMINI_NARRATIVE_MAX_TOKENS` (zero consumers)

### Prisma Validate Fix
- Set `DATABASE_URL=file:./dev.db` in `.env` (not `.env.local`) so `prisma validate` passes in CI. Runtime override via `db.js` is unaffected.

---

*End of PHASE_0_AUDIT.md — awaiting Phase 1 execution approval.*
