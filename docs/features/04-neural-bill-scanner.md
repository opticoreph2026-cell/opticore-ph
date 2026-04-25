# Feature 04: Neural Bill Scanner (AI Scan)

## Overview
Allows users to upload a photo of their electricity bill. Gemini Vision AI extracts all relevant fields automatically (kWh, total bill, billing date, provider name) and pre-fills the submission form.

## Routes
| Type | Path | Description |
|------|------|-------------|
| Component | `SubmitReadingModal.js` (scan mode) | File upload UI |
| API | `POST /api/ai/scan` | Sends image to Gemini Vision, extracts bill data |
| API | `POST /api/ai/parse-bill` | Alternative detailed bill parser |

## Key Files
- `src/app/api/ai/scan/route.js` — Main bill scanning endpoint
- `src/app/api/ai/parse-bill/route.js` — Detailed unbundled charge parser

## Scan Flow
```
User uploads image (max 4MB)
  ↓
FileReader converts to base64
  ↓
POST /api/ai/scan with base64 image
  ↓
Gemini Vision AI reads the bill
  ↓
Returns: { kwhUsed, totalAmount, billingDate, providerName, type }
  ↓
Pre-fills submission form fields
  ↓
User reviews and confirms
```

## Supported File Types
- JPG / PNG / WebP / PDF (first page)
- Max size: **4MB**

## Plan Limits
| Plan | Monthly Scans |
|------|-------------|
| Starter | 1 scan/month |
| Pro | Unlimited |
| Business | Unlimited |

## Error Reference
| HTTP | Error | Cause | Fix |
|------|-------|-------|-----|
| 400 | `No image provided` | Frontend sent empty body | Ensure file is read before sending |
| 400 | `Water bill scanning is restricted` | Scanned bill detected as water type | Tell user to use manual entry for water bills |
| 413 | File too large | Image > 4MB | Compress image before upload |
| 500 | Gemini API error | API key invalid or quota exceeded | Check `GEMINI_API_KEY` in Vercel env vars |
| 403 | Scan limit reached | Starter user used their 1 monthly scan | Upgrade plan or wait for next month |

## Known Bugs Fixed
- ✅ `2026-04` — Model name `gemini-2.5-flash` caused 500 errors (corrected to `gemini-1.5-flash`)

## How to Debug Quickly
1. DevTools → Network → find the `POST /api/ai/scan` request
2. Check request payload — confirm `image` field is a base64 string starting with `data:image/...`
3. Check response body for the parsed JSON
4. If 500: verify `GEMINI_API_KEY` is set correctly and has quota remaining
