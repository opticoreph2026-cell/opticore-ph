# Feature 01: Authentication System

## Overview
Handles user registration, login, session management, and JWT-based route protection for all OptiCore PH users.

## Routes
| Type | Path | Description |
|------|------|-------------|
| Page | `/login` | Login form |
| Page | `/signup` | Registration form |
| API | `POST /api/auth/login` | Validates credentials, issues JWT cookies |
| API | `POST /api/auth/signup` | Creates new user account |
| API | `POST /api/auth/logout` | Clears auth cookies |
| API | `GET /api/auth/me` | Returns current user profile from JWT |
| API | `POST /api/auth/refresh` | Rotates access token using refresh token |
| Middleware | `src/middleware.js` | Protects all `/dashboard` and `/admin` routes |

## Key Files
- `src/app/api/auth/login/route.js` — Rate-limited login handler, bcrypt + SHA-256 legacy support
- `src/app/api/auth/me/route.js` — Returns decoded JWT payload
- `src/lib/auth.js` — `signAccessToken`, `signRefreshToken`, `verifyPassword`, `setAuthCookies`
- `src/lib/ratelimit.js` — In-memory rate limiter (5 attempts / 15 min per IP)
- `src/middleware.js` — JWT verification on protected routes

## Plan Gating
| Role | Access |
|------|--------|
| `client` (starter) | Dashboard, limited features |
| `client` (pro) | All client features except Forecast |
| `client` (business) | All features |
| `admin` | `/admin` panel only |

## Error Reference
| HTTP | Error Message | Cause | Fix |
|------|--------------|-------|-----|
| 401 | `Invalid email or password.` | Wrong credentials | Normal — user error |
| 429 | `Too many login attempts` | Rate limit hit | Wait 15 min or clear rate limit map |
| 503 | `Service temporarily unavailable.` | **Database lookup failed** | Check `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` env vars |
| 400 | `Invalid request body.` | Malformed JSON sent | Check frontend fetch call |

## Known Bugs Fixed
- ✅ `2026-04` — 405 errors on `/api/auth/me` (fixed by ensuring GET handler exists)
- ✅ `2026-04` — Redirect loops on protected pages (fixed in middleware)
- ✅ `2026-04` — 503 on Vercel due to LibSQL client version mismatch (fixed `@libsql/client@0.8.0`)

## How to Debug Quickly
1. Open **Vercel Dashboard → Deployments → [latest] → Functions Logs**
2. Filter by `/api/auth/login`
3. Look for `[Login API] Database lookup failed:` log line
4. If present: the issue is DB connectivity, not code logic
