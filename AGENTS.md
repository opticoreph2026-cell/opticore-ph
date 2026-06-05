# AGENTS.md — OptiCore PH Global Context

> This file is the single source of truth for AI coding agents working on this repository.
> Read this before touching any code.

---

## Project

**OptiCore PH** — Electricity bill intelligence SaaS for the Philippine market.
Target users: Filipino households, SMEs. Mobile-first (375px baseline).

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (new code) · JS (legacy, `allowJs: true`) |
| Database | Prisma 6.2.1 + Turso (LibSQL) via `@prisma/adapter-libsql` |
| Auth | Custom jose JWT (`src/lib/auth.js`) — **NOT** NextAuth |
| AI | Google Gemini (`@google/genai`) |
| Payments | PayMongo |
| Email | Gmail OAuth2 REST API (`googleapis`) |
| Animations | Framer Motion |
| Charts | Recharts |
| Data fetching | SWR |

## Design System — "Obsidian Refined"

```css
--surface-1000: #08080B   /* page background */
--surface-900:  #0F0F14   /* card background */
--surface-800:  #16161D   /* elevated surface */
border-subtle:  rgba(255,255,255,0.04)
border-glow:    rgba(255,255,255,0.08)
accent-amber:   #F5A524
accent-cyan:    #06B6D4
accent-emerald: #10B981
accent-rose:    #F43F5E
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
prisma validate  →  needs DATABASE_URL=file:./dev.db in .env
prisma generate  →  run after schema changes
prisma db push   →  applies schema to Turso in production
Runtime:         →  db.js auto-selects LibSQL adapter when TURSO_DATABASE_URL is set
```

## Key Files

| File | Purpose |
|---|---|
| `src/lib/db.js` | DB singleton + all query helpers |
| `src/lib/auth.js` | JWT sign/verify, cookie helpers |
| `src/lib/money.ts` | Money conversion utilities (centavos, rate units) |
| `src/lib/email.js` | Gmail OAuth2 transactional email |
| `src/lib/paymongo.js` | PayMongo API wrapper |
| `src/middleware.js` | JWT auth guard for `/dashboard` and `/api/dashboard` routes |
| `prisma/schema.prisma` | Database schema |
| `prisma/seed.ts` | Provider seed data |

## Deleted / Orphaned (DO NOT RECREATE)

- `DailyMeterReading`, `LPGReading`, `ApplianceCatalog` models
- `ApplianceCategory` enum
- API routes: `daily-readings/`, `lpg/`, `dashboard/catalog/`, `forecast/`, `attribution/`, `certification/`, `admin/catalog/`, `ai/acoustic/`
- UI: `acoustic-scan/` page, `AcousticAuditor.js`, `ApplianceCatalogClient.tsx`
- Env vars: `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `NEXTAUTH_SECRET`, `FEATURE_DEMO_MODE`

## Environment Variables

See `.env.example` for full documentation. Critical runtime vars:

```
TURSO_DATABASE_URL + TURSO_AUTH_TOKEN  →  Production DB
GEMINI_API_KEY                         →  AI features
PAYMONGO_SECRET_KEY                    →  Payments
JWT_SECRET + JWT_REFRESH_SECRET        →  Auth tokens
GMAIL_CLIENT_ID/SECRET/REFRESH_TOKEN  →  Transactional email
```
