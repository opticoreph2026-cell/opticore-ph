import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getCurrentUser } from '@/lib/auth';
import { getClientById, incrementClientScanQuota, resetClientScanQuota } from '@/lib/db';
import { findProvider } from '@/data/utilityProviders';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL,
    'X-Title': 'OptiCore PH',
  },
});

const MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'google/gemini-flash-1.5-8b',
  'qwen/qwen2.5-vl-7b-instruct:free',
  'meta-llama/llama-3.2-11b-vision-instruct:free'
];

async function callVisionAI(mimeType, base64string, prompt) {
  const errors = [];
  
  for (const model of MODELS) {
    try {
      const response = await openai.chat.completions.create({
        model,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64string}`,
              }
            },
            { type: 'text', text: prompt }
          ]
        }],
        max_tokens: 1000,
      });
      
      console.log(`[Scan API] Success with model: ${model}`);
      return {
        content: response.choices[0]?.message?.content || '',
        usage: response.usage
      };
    } catch (err) {
      const status = err.status || err.response?.status;
      const message = err.message || 'Unknown error';
      console.warn(`[Scan API] Model ${model} failed (Status: ${status}): ${message}`);
      errors.push(`${model}: ${message}`);
      
      // If it's a 401 (Auth) or something non-retriable, stop early
      if (status === 401) throw err;
      
      continue;
    }
  }
  
  console.error('[Scan API] All models failed:', errors.join(' | '));
  throw new Error('All vision models are currently unavailable. Please try again in a few minutes.');
}

/**
 * POST /api/ai/scan
 * 
 * Vision-based OCR for Philippine Utility Bills.
 * Targets: Meralco, VECO, Primewater, etc.
 */
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const client = await getClientById(user.sub);
    if (!client) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const plan = client.planTier ?? 'starter';

    if (plan === 'starter') {
      const now = new Date();
      if (client.lastScanReset && (now - new Date(client.lastScanReset)) > 30 * 24 * 60 * 60 * 1000) {
        await resetClientScanQuota(client.id);
        client.scanCount = 0;
      }
      if (client.scanCount >= 1) {
        return NextResponse.json(
          { error: 'QUOTA_EXCEEDED', message: 'You have reached your 1 free AI scan limit. Upgrade to Pro for unlimited scans and deep analysis.' },
          { status: 403 }
        );
      }
    }

    const { image, mimeType = 'image/jpeg', fileName } = await request.json(); // base64 encoded image
    if (!image) {
      return NextResponse.json({ error: 'No image data provided.' }, { status: 400 });
    }

    const base64string = image.split(',')[1] || image;

    const prompt = `You are a utility bill parser for the Philippines. Analyze this utility bill carefully.

Return ONLY a raw JSON object. No markdown. No code blocks. No explanation. Just the JSON object itself.

{
  "kwhUsed": <number or null>,
  "totalAmount": <number or null>,
  "billingDate": "<YYYY-MM-DD or null>",
  "providerName": "<string or null>",
  "type": "<electricity or water>"
}

Rules:
- kwhUsed: total kilowatt-hours consumed this period
- totalAmount: total amount due in Philippine Peso
- billingDate: billing period end date in YYYY-MM-DD
- providerName: utility company (MERALCO, VECO, MCWD)
- type: electricity if kWh mentioned, water if cubic meters
- If any field cannot be found, use null
- Return ONLY the JSON. Nothing else.`;

    const { content: rawText, usage } = await callVisionAI(mimeType, base64string, prompt);
    console.log('[Scan API] OpenRouter raw response:', rawText);

    // Track usage in background
    const { incrementTokenUsage, incrementScanCount } = await import('@/lib/db');
    if (usage?.total_tokens) {
      await incrementTokenUsage(client.id, usage.total_tokens);
    }
    await incrementScanCount(client.id);

    function extractBillJSON(text) {
      const cleaned = text
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/gi, '')
        .trim();
      try {
        return JSON.parse(cleaned);
      } catch {
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
        throw new Error('No valid JSON found in response');
      }
    }

    let rawData;
    try {
      rawData = extractBillJSON(rawText);
    } catch (parseError) {
      console.error('[Scan API] Parse Failure:', parseError);
      return NextResponse.json({ 
        error: 'PARSE_FAILED',
        message: 'Could not extract bill data. For PDFs, ensure the bill is text-based. Try uploading a JPG photo instead.'
      }, { status: 422 });
    }

    // Cross-reference with our Registry
    const verifiedProvider = findProvider(rawData.providerName || '');

    const enrichedData = {
      ...rawData,
      verifiedProvider: verifiedProvider ? {
        id: verifiedProvider.id,
        officialName: verifiedProvider.name,
        region: verifiedProvider.region
      } : null,
      isCooperative: rawData.providerName ? /Electric Cooperative|ELCO/i.test(rawData.providerName) : false
    };

    if (plan === 'starter') {
      await incrementClientScanQuota(client.id);
    }

    // Fire admin notification (non-blocking)
    const { createAdminNotification } = await import('@/lib/db');
    createAdminNotification({
      type: 'ai_scan',
      title: 'AI Bill Scan',
      message: `${client.name || client.email} scanned a ${rawData.providerName || 'Utility'} bill.`,
      meta: { clientId: client.id, email: client.email, provider: rawData.providerName, amount: rawData.totalAmount },
    }).catch(() => { });

    return NextResponse.json({
      success: true,
      data: enrichedData
    });

  } catch (error) {
    console.error('[Vision OCR] Critical Error:', error);

    // Standardized SRE Error for rate limits or AI failures
    if (error.status === 429 || error.message?.includes('429')) {
      return NextResponse.json(
        { error: "AI_LIMIT", message: "AI Engine is at capacity. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "AI_ERROR", message: "Failed to parse bill. Ensure the photo is clear and try again." },
      { status: 500 }
    );
  }
}
