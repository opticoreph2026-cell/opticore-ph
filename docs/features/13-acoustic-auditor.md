# Feature 13: Acoustic Auditor

## Overview
An AI-powered hardware diagnostic tool that analyzes a short audio recording of a household appliance (AC, refrigerator) and classifies its acoustic health. Detects failing compressors, capacitors, and fan issues.

## Routes
| Type | Path | Description |
|------|------|-------------|
| Page | `/dashboard/acoustic-scan` | Acoustic auditor UI |
| API | `POST /api/ai/acoustic` | Sends audio to Gemini for analysis |

## Key Files
- `src/app/dashboard/acoustic-scan/page.js` — Page shell
- `src/components/dashboard/AcousticAuditor.js` — Recording UI + result display
- `src/app/api/ai/acoustic/route.js` — Audio analysis endpoint

## Analysis Flow
```
User clicks "Record" (browser mic access requested)
  ↓
Audio captured as WebM/OGG blob
  ↓
Blob converted to base64
  ↓
POST /api/ai/acoustic with base64 audio
  ↓
Gemini 1.5 Flash analyzes acoustic signature
  ↓
Returns JSON: { status, diagnosis, phantomLoadPenalty, estimatedWastedCost, recommendedAction }
  ↓
Result displayed with severity color coding
```

## AI Response Schema
```json
{
  "status": "HEALTHY | WARNING | CRITICAL | UNKNOWN",
  "diagnosis": "Description of what was heard",
  "phantomLoadPenalty": 35,
  "estimatedWastedCost": 800,
  "recommendedAction": "Replace compressor capacitor immediately"
}
```

## Error Reference
| HTTP | Error | Cause | Fix |
|------|-------|-------|-----|
| 400 | `No audio data provided` | Frontend sent empty body | Ensure recording completed before sending |
| 500 | `Audio analysis failed` | Gemini API rejected audio / parse error | Ensure clip is > 3 seconds and clear |
| 401 | `Unauthorized` | Session expired | Re-login |
| Model error | API returns garbled text | Gemini couldn't parse audio | Try again with a different/longer clip |

## Known Bugs Fixed
- ✅ `2026-04` — Model name `gemini-2.5-flash` caused 500 errors (corrected to `gemini-1.5-flash`)

## How to Debug Quickly
1. DevTools → Network → find `POST /api/ai/acoustic`
2. Check that the request payload has a valid `audioData` base64 string
3. Check the response body — if raw text instead of JSON, the AI response wasn't parsed correctly
4. Increase recording length (> 5 seconds) for better results
5. Test with `GEMINI_API_KEY` quota — if exhausted, all Gemini calls will fail
