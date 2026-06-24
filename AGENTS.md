# AGENTS.md — OptiCore PH Global Context

> This file is the single source of truth for AI coding agents working on this repository.
> Read this before touching any code.

---

## Project

**OptiCore Energy Solutions** — Solar + ESS CRM and engineering platform for Cebu, Bohol, and Leyte.
Target users: households, SMEs, installation partners. Mobile-first (375px baseline). Bilingual EN/Fil.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (new code) · JS (legacy, `allowJs: true`) |
| Database | Prisma 6.2.1 + **Supabase PostgreSQL** |
| Auth | **NextAuth v5** (`src/auth.ts`) — Credentials + OTP (Gmail API) |
| i18n | **next-intl** — English + Filipino (`messages/en.json`, `messages/fil.json`) |
| AI | Google Gemini (`@google/genai`) |
| Payments | PayMongo |
| Email | Gmail OAuth2 REST API (`googleapis`) |
| Animations | Framer Motion |
| Charts | Recharts |
| Data fetching | SWR |

## Design System — "Navy Professional"

```css
--surface-1000: #0A1628   /* page background — deep navy */
--surface-900:  #0F1F36   /* card background — navy */
--surface-800:  #152A4A   /* elevated surface — lighter navy */
border-subtle:  rgba(255,255,255,0.06)
border-glow:    rgba(255,255,255,0.12)
accent-blue:    #2563EB   /* primary CTA / links — Electric Blue */
accent-cyan:    #06B6D4   /* secondary highlight */
accent-emerald: #10B981   /* success / positive */
accent-rose:    #F43F5E   /* warning / negative */
font-display:   Outfit
font-body:      Inter
font-mono:      JetBrains Mono
```

## Non-Negotiables

| Rule | Detail |
|---|---|
| **Money** | All amounts stored as `Int` centavos (₱ × 100). Rates as `Int` rate units (₱/kWh × 10,000). Use `src/lib/money.ts` helpers. **Never Float for money.** |
| **Dates** | Always `DateTime`, never `String`. |
| **API routes** | Edge runtime where possible. Parallel queries. No `SELECT *` (use `select:`). |
| **Lists** | Always implement: skeleton → empty → error → loaded states. |
| **Destructive actions** | Confirmation modal required. |
| **Animations** | Must respect `prefers-reduced-motion`. |
| **Copy** | Must pass the "tita test" (non-techie Filipino understands it). |
| **New code** | Must be `.ts`. Legacy `.js` files migrate opportunistically. |

## Launch Strategy

- **Meralco**: Full support (isSupported: true, bestEffortOnly: false)
- **VECO / Davao Light**: Beta (isSupported: true, bestEffortOnly: true)
- **Everything else**: "Coming Soon" submission flow

## Database Quick Reference

```
DATABASE_URL + DIRECT_URL  →  Supabase PostgreSQL pooler (aws-1-ap-southeast-1)
AUTH_SECRET + AUTH_URL     →  NextAuth v5 (AUTH_URL unset — auto-detected)
Runtime:                   →  src/lib/db.js PrismaClient singleton
```

## Key Files

| File | Purpose |
|---|---|
| `src/lib/db.js` | DB singleton + query helpers |
| `src/auth.ts` | NextAuth v5 config — authorize has console.log diagnostics for each failure mode |
| `src/lib/session.ts` | Server-side `getSession()` for API routes & layouts |
| `src/lib/money.ts` | Money conversion utilities (centavos, rate units) |
| `src/lib/email.js` | Gmail OAuth2 transactional email (OTP, welcome, contact, password reset) |
| `src/lib/paymongo.js` | PayMongo API wrapper |
| `src/lib/validations.ts` | Zod schemas for all POST endpoints |
| `src/lib/rate-limit.ts` | In-memory rate limiter (2–5 req/min per IP) |
| `src/lib/password.ts` | `hashPassword` (bcrypt), `verifyPassword` (bcrypt + legacy SHA-256) |
| `src/middleware.ts` | NextAuth + next-intl combined middleware |
| `prisma/schema.prisma` | Database schema (1212 lines) |
| `prisma/seed-energy.ts` | Provider seed data (3 orgs, 5 inverters, 3 batteries, 4 panels, 3 users) |
| `.env` | Supabase pooler URLs, AUTH_SECRET, EMAIL_FROM |
| `.env.local` | Gmail OAuth2, DATABASE_URL (Supabase), AUTH_SECRET, GEMINI_API_KEY, JWT secrets, PayMongo |

## Gotchas / Build Fixes

- API route files containing JSX must be `route.tsx`, not `route.ts` (e.g., `quotations/[id]/pdf/route.tsx`)
- `Map.entries()` iteration requires `Array.from()` wrapper to avoid `--downlevelIteration` flag
- `.env.local` takes precedence over `.env` in Next.js — was overriding `DATABASE_URL` to SQLite (`file:./dev.db`), causing "no users in DB" login failures
- Setting `AUTH_URL` to a fixed port (e.g. `http://localhost:3000`) can break cookie domain when dev server runs on a different port — leave it unset to auto-detect
- Rate limiter is in-memory (`Map`) — fine for single-instance dev; for Vercel serverless use Upstash Redis

## Deleted / Orphaned (DO NOT RECREATE)

- `DailyMeterReading`, `LPGReading`, `ApplianceCatalog` models
- `ApplianceCategory` enum
- API routes: `daily-readings/`, `lpg/`, `dashboard/catalog/`, `forecast/`, `attribution/`, `certification/`, `admin/catalog/`, `ai/acoustic/`
- UI: `acoustic-scan/` page, `AcousticAuditor.js`, `ApplianceCatalogClient.tsx`
- Env vars: `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `NEXTAUTH_SECRET`, `FEATURE_DEMO_MODE`

## Environment Variables

See `.env.example` for full documentation. Critical runtime vars:

| Variable | Source | Notes |
|---|---|---|
| `DATABASE_URL` | `.env.local` (> `.env`) | Supabase PostgreSQL pooler — was being overridden to SQLite! |
| `DIRECT_URL` | `.env.local` (> `.env`) | Supabase PostgreSQL pooler |
| `AUTH_SECRET` | `.env.local` (> `.env`) | Required by NextAuth v5 — was missing! |
| `AUTH_URL` | Unset | Auto-detected from request — do NOT set to a fixed port |
| `GMAIL_CLIENT_ID/SECRET/REFRESH_TOKEN` | `.env.local` | Gmail OAuth2 for transactional email |
| `GEMINI_API_KEY` | `.env.local` | AI features |
| `PAYMONGO_SECRET_KEY` | `.env.local` | Payments |
| `NEXT_PUBLIC_APP_URL` | Both | `http://localhost:3000` for dev |

## Seed Users (Password: `OptiCore-ES2026`)

| Name | Email | Role |
|---|---|---|
| Julius | julius@opticore.ph | opticore_owner |
| Jeric | jeric@onsite-install.com | partner_admin |
| Aldrean | aldrean@siddlak.com | partner_admin |

> DB was seeded with wrong emails initially (`jeric@example.ph`, `aldrean@sidlakdev.ph`). Corrected to match AGENTS.md.
