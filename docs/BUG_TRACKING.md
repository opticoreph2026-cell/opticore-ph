# OptiCore PH — Bug Tracking Guide

> The fastest way to find, classify, and fix bugs in production.

---

## 🧭 The 3-Layer Debugging System

Every bug in OptiCore PH falls into one of **three layers**. Identify the layer first, then follow the matching checklist.

```
Layer 1: Frontend (Browser)     → Check DevTools Console + Network
Layer 2: Backend (API Routes)   → Check Vercel Function Logs
Layer 3: Database (Turso)       → Check DB connection + schema
```

---

## 🔴 Layer 1 — Frontend Bugs

### How to Open DevTools
`F12` (Windows) or Right-click → Inspect → **Console** tab

### What to Look For
| Error Type | Example | What It Means |
|-----------|---------|--------------|
| `ReferenceError: X is not defined` | `Activity is not defined` | A component uses an import that wasn't declared |
| `TypeError: Cannot read properties of null` | `Cannot read properties of null (reading 'get')` | State/data is `null` when the component tries to use it |
| `Failed to load resource: 404` | Any API route | API endpoint doesn't exist or URL is wrong |
| `Failed to load resource: 500` | `/api/dashboard/readings` | Backend crashed — move to Layer 2 |
| `Failed to load resource: 401` | `/api/auth/me` | Session expired — user needs to re-login |
| `Failed to load resource: 503` | `/api/auth/login` | **Database is unreachable** — move to Layer 3 |
| White screen / blank page | (no error) | Check **Network tab** for a failed initial API call |

### Checklist
- [ ] Open DevTools → Console → read the **first** red error
- [ ] Check the line number — e.g., `layout-abc.js:16` means a layout/sidebar file
- [ ] For `ReferenceError: X is not defined` → search `grep_search` for `X` across all `.js` files and add the missing import
- [ ] For network errors → click the failed request in Network tab → read the **Response** body

---

## 🟡 Layer 2 — Backend / API Bugs

### How to Access Vercel Function Logs
1. Go to [vercel.com](https://vercel.com) → your project → **Deployments**
2. Click the latest deployment → **Functions** tab
3. Filter by the route that's failing (e.g., `/api/auth/login`)
4. Read the log lines

### What to Look For
| Log Pattern | Meaning | Fix |
|------------|---------|-----|
| `[Login API] Database lookup failed:` | DB query crashed in login route | Layer 3 — check DB |
| `[Anomaly Engine] Non-fatal error:` | Ghost load engine crashed | Non-fatal, but check `attributionEngine.js` |
| `[Water Analyzer Error]` | Water leak algo crashed | Check `waterAnalyzer.js` |
| `[LPG Forecaster] Non-fatal error:` | LPG predictor crashed | Check `lpgPredictor.js` |
| `[OptiCore DB] CRITICAL INITIALIZATION ERROR:` | Prisma failed to connect | Layer 3 — DB connection problem |
| `Failed to parse AI output:` | Gemini returned non-JSON | Retry; if persistent, check prompt format |

### HTTP Status Meaning
| Status | Meaning | Check |
|--------|---------|-------|
| 200 | ✅ Success | N/A |
| 400 | Bad request — missing fields | Frontend is sending wrong data |
| 401 | Unauthorized | JWT cookie missing or expired |
| 403 | Forbidden | User plan doesn't have access |
| 404 | Route not found | Check URL spelling |
| 409 | Conflict | Duplicate entry (e.g., same reading date) |
| 429 | Rate limited | Wait 15 min or clear rate limiter |
| 500 | Server error | Check Vercel logs for the exact error |
| 503 | Service unavailable | **Almost always a DB connection failure** |

### Checklist
- [ ] Find the failing API route from DevTools Network tab
- [ ] Go to Vercel → Functions → filter by that route
- [ ] Find the matching log line (use the table above)
- [ ] If DB-related → move to Layer 3

---

## 🟢 Layer 3 — Database Bugs

### Root Cause: 99% of 503 errors are missing/wrong env vars.

### How to Check
1. Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Confirm these exist:
   - `TURSO_DATABASE_URL` — must start with `libsql://`
   - `TURSO_AUTH_TOKEN` — long JWT string
   - `GEMINI_API_KEY` — Google AI key
   - `JWT_SECRET` — at least 32 chars
   - `JWT_REFRESH_SECRET` — at least 32 chars

3. Run the local DB test:
```bash
node scratch/test_db.js
```
Expected output: `SUCCESS! User count: X`

### Common DB Error Scenarios
| Symptom | Root Cause | Fix |
|---------|-----------|-----|
| 503 on `/api/auth/login` | `TURSO_DATABASE_URL` is wrong or missing | Re-add env var in Vercel |
| 503 on providers / readings | DB table doesn't exist | Run `npx prisma db push` |
| Prisma "adapter" error | `@libsql/client` version mismatch | Pin to `0.8.0` in `package.json` |
| "Cannot use constructor" error | Wrong `PrismaLibSQL` init pattern | Use explicit `createClient()` → then pass to adapter |

### Checklist
- [ ] Verify all 5 env vars are present in Vercel settings
- [ ] Run `node scratch/test_db.js` locally to confirm DB is reachable
- [ ] If env vars are correct but still failing: re-deploy in Vercel (sometimes env var changes need a redeploy)

---

## 🐞 Bug Log (Resolved)

Track all fixed bugs here in chronological order.

| Date | Feature | Bug | Status |
|------|---------|-----|--------|
| 2026-04-25 | Dashboard Overview | `Activity is not defined` crashes entire layout | ✅ Fixed — added `Activity` to Sidebar.js import |
| 2026-04-25 | All Features | `503 Service Unavailable` on login/providers | ✅ Fixed — `@libsql/client` downgraded to `0.8.0` |
| 2026-04-25 | Acoustic Auditor | `500` on audio analysis | ✅ Fixed — model name corrected to `gemini-1.5-flash` |
| 2026-04-25 | LPG Predictor | Alert not saving (property name mismatch) | ✅ Fixed — `clientId` → `client_id` in createAlert call |
| 2026-04-22 | Auth | 405 errors on `/api/auth/me` | ✅ Fixed — added GET handler |
| 2026-04-22 | Auth | Redirect loops on dashboard | ✅ Fixed — middleware condition corrected |
| 2026-04-22 | Charts | Duplicate bars for same month | ✅ Fixed — deduplication logic in Overview.js |

---

## 💡 Pro Tips for Fast Debugging

### 1. Read the FIRST error, not the last
The browser console shows cascading errors. The root cause is almost always the **first red line**, not the last one.

### 2. The 503/503 rule
If you see `503` on any API call, **don't touch the code**. Check the database connection first. 90% of 503s are env var issues.

### 3. Look for the `[BRACKET LOG]` pattern
All OptiCore backend routes use `[Feature Name]` prefix in logs (e.g., `[Login API]`, `[Water Analyzer Error]`). Search for these in Vercel logs to pinpoint the exact file.

### 4. Non-fatal errors won't break the app
The reading submission pipeline wraps intelligence engines (Ghost Load, Water Leak, LPG) in `try/catch`. If they crash, the reading still saves. The user won't see an error, but you'll see `Non-fatal error` in Vercel logs.

### 5. The fastest way to test a fix
```bash
# 1. Make code change
# 2. Commit and push
git add . && git commit -m "fix: description" && git push origin main
# 3. Vercel auto-deploys in ~2 minutes
# 4. Test on live site
```

---

## 📋 Bug Report Template

When reporting a bug, use this format:

```
## Bug: [Short Title]

**Feature Affected**: [e.g., Reading Submission]
**Page/Route**: [e.g., /dashboard → POST /api/dashboard/readings]
**User Plan**: [starter/pro/business]

**Steps to Reproduce**:
1. ...
2. ...

**Expected Behavior**: ...
**Actual Behavior**: ...

**Console Error** (copy from DevTools):
```
[paste error here]
```

**Vercel Log** (if backend):
```
[paste log line here]
```

**Suspected Layer**: Frontend / Backend / Database
```
