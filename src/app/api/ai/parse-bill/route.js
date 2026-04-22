/**
 * POST /api/ai/parse-bill
 * 
 * Gemini-powered Philippine utility bill parser.
 * Accepts a base64-encoded PDF or image of an electricity bill
 * and extracts all unbundled charges into a structured JSON response.
 * 
 * Body: { file: string (base64), mimeType: string, fileName?: string }
 * Returns: { success: true, data: { ... } } or { error: string }
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getClientById, incrementClientScanQuota, resetClientScanQuota, db } from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ── Gemini Client (singleton) ─────────────────────────────────────────────────
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ── System Prompt: Philippine Utility Bill Extraction ─────────────────────────
const SYSTEM_PROMPT = `You are OptiCore PH Bill Analyzer, an elite AI utility-bill parser specialized in Philippine electricity bills.

YOUR TASK:
Analyze the uploaded document (PDF or image) of a Philippine electricity bill. Extract all financial and consumption data with absolute precision.

SUPPORTED PROVIDERS:
- VECO (Visayan Electric Company)
- MECO (Manila Electric Company / Meralco)
- Meralco
- BATELEC (Batangas Electric)
- CEBECO (Cebu Electric Cooperative)
- Any other Philippine electric utility or cooperative

EXTRACTION RULES:
1. Extract the EXACT numeric values shown on the bill. Do not estimate or calculate.
2. Parse amounts in Philippine Peso (₱). Remove commas, currency symbols. Return numbers only.
3. If a field is not visible or not applicable, return null for that field.
4. For subsidies/discounts, return the value as a NEGATIVE number (e.g., -50.00 for a ₱50 discount).
5. "readingDate" should be the bill date or statement date in YYYY-MM-DD format.
6. "billingPeriod" should be the period covered, e.g., "2024-01-15 to 2024-02-14".
7. "providerDetected" should be the utility company name as printed on the bill.
8. "totalKwh" is the total kilowatt-hours consumed during the billing period.
9. "totalBillAmount" is the TOTAL AMOUNT DUE on the bill.

RESPOND WITH EXACTLY THIS JSON STRUCTURE AND NOTHING ELSE:
{
  "totalKwh": <number>,
  "totalBillAmount": <number>,
  "generationCharge": <number|null>,
  "transmissionCharge": <number|null>,
  "systemLoss": <number|null>,
  "distributionCharge": <number|null>,
  "subsidies": <number|null>,
  "governmentTax": <number|null>,
  "vat": <number|null>,
  "otherCharges": <number|null>,
  "readingDate": "<YYYY-MM-DD>",
  "billingPeriod": "<start to end>",
  "providerDetected": "<string>",
  "accountName": "<string|null>",
  "accountNumber": "<string|null>",
  "meterNumber": "<string|null>"
}

CRITICAL:
- Output ONLY the raw JSON object. No markdown, no backticks, no explanation.
- If the document is NOT a Philippine utility bill or is unreadable, respond with:
  {"error": "UNREADABLE", "reason": "<brief reason>"}
`;

// ── Allowed MIME types ────────────────────────────────────────────────────────
const ALLOWED_MIMES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

// ── Max file size: 10MB base64 (~7.5MB raw) ──────────────────────────────────
const MAX_BASE64_LENGTH = 10 * 1024 * 1024;

export async function POST(request) {
  try {
    // 1. Authenticate
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await getClientById(user.sub);
    if (!client) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 1.5 Gate: Require at least 1 appliance to parse bills (for Attribution Engine context)
    const applianceCount = await db.appliance.count({
      where: { clientId: user.sub }
    });
    
    if (applianceCount === 0) {
      return NextResponse.json({ 
        error: 'HARDWARE_REQUIRED', 
        message: 'Please register at least one appliance in your Inventory Profiling before scanning a bill. OptiCore needs this data to detect leaks and phantom loads.' 
      }, { status: 403 });
    }

    const plan = client.planTier ?? 'starter';

    if (plan === 'starter') {
      const now = new Date();
      if (client.lastScanReset && (now - new Date(client.lastScanReset)) > 30 * 24 * 60 * 60 * 1000) {
        await resetClientScanQuota(client.id);
        client.scanCount = 0;
      }
      if (client.scanCount >= 3) {
        return NextResponse.json(
          { error: 'Upgrade required. You have reached your 3 free AI scans for the month.' }, 
          { status: 403 }
        );
      }
    }

    // 2. Validate API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('[OptiCore AI] GEMINI_API_KEY is not configured.');
      return NextResponse.json(
        { error: 'AI service is not configured. Contact support.' },
        { status: 503 }
      );
    }

    // 3. Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const { file, mimeType } = body;

    if (!file || !mimeType) {
      return NextResponse.json(
        { error: 'Missing required fields: file (base64) and mimeType.' },
        { status: 400 }
      );
    }

    // 4. Validate MIME type
    if (!ALLOWED_MIMES.has(mimeType)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${mimeType}. Upload PDF, PNG, JPG, or WebP.` },
        { status: 400 }
      );
    }

    // 5. Validate file size
    if (file.length > MAX_BASE64_LENGTH) {
      return NextResponse.json(
        { error: 'File is too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // 6. Call Gemini 2.5 Flash with multimodal input
    console.log('[OptiCore AI] Sending bill to Gemini for analysis...');
    const startTime = Date.now();

    let response;
    try {
      const model = ai.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        systemInstruction: SYSTEM_PROMPT 
      });
      
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType,
            data: file,
          },
        },
      ]);
      response = { text: result.response.text() };
    } catch (aiError) {
      console.error('[OptiCore AI] Gemini API Call Failed:', aiError);
      return NextResponse.json(
        { "error": "AI_LIMIT", "message": "Service busy" },
        { status: 429 }
      );
    }

    const elapsed = Date.now() - startTime;
    console.log(`[OptiCore AI] Gemini responded in ${elapsed}ms`);

    // 7. Extract and parse the response
    const rawText = response.text?.trim();

    if (!rawText) {
      return NextResponse.json(
        { error: 'AI returned an empty response. Please try a clearer image.' },
        { status: 422 }
      );
    }

    // Clean potential markdown code fences
    let jsonText = rawText;
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      console.error('[OptiCore AI] Failed to parse Gemini response:', rawText.substring(0, 300));
      return NextResponse.json(
        { error: 'AI could not extract structured data from this document. Try a clearer scan.' },
        { status: 422 }
      );
    }

    // 8. Check for AI-reported errors (unreadable document)
    if (parsed.error === 'UNREADABLE') {
      return NextResponse.json(
        { error: `Document could not be read: ${parsed.reason || 'Unknown reason'}` },
        { status: 422 }
      );
    }

    // 9. Validate minimum required fields
    if (!parsed.totalKwh && !parsed.totalBillAmount) {
      return NextResponse.json(
        { error: 'Could not extract consumption or billing data. Ensure the full bill is visible.' },
        { status: 422 }
      );
    }

    // 10. Compute effective rate if not already present
    if (parsed.totalKwh > 0 && parsed.totalBillAmount > 0) {
      parsed.effectiveRate = Number((parsed.totalBillAmount / parsed.totalKwh).toFixed(4));
    }

    // 11. Count successful quota if free user
    if (plan === 'starter') {
      await incrementClientScanQuota(client.id);
    }

    return NextResponse.json({
      success: true,
      data: parsed,
      meta: {
        model: 'gemini-2.5-flash',
        processingTimeMs: elapsed,
      },
    });

  } catch (error) {
    console.error('[OptiCore AI] General Route Error:', error);
    return NextResponse.json(
      { "error": "AI_LIMIT", "message": "Service busy" },
      { status: 500 }
    );
  }
}
