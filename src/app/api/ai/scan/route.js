import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCurrentUser } from '@/lib/auth';
import { getClientById, incrementClientScanQuota, resetClientScanQuota } from '@/lib/db';
import { findProvider } from '@/data/utilityProviders';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

    const { image } = await request.json(); // base64 encoded image
    if (!image) {
      return NextResponse.json({ error: 'No image data provided.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const deepAnalysisInstruction = plan !== 'starter' 
      ? '- unbundledCharges: (Object) { generation: number, transmission: number, systemLoss: number, vat: number }\n      Extract granular transmission fees, VAT, and system loss metrics. Be extremely precise.'
      : '- unbundledCharges: null (Skip deep unbundled breakdown for this tier).';

    const prompt = `
      You are an expert utility bill auditor for the Philippines. 
      Analyze this bill from any Philippine Electric Cooperative (EC), Distribution Utility (DU), or Water District (WD).
      
      Extract the following data in strict JSON format:
      - providerName: (String) Name of the utility company/cooperative. Must be highly accurate (e.g., "BENECO", "Meralco", "Davao Light").
      - type: (String) "ELECTRIC" or "WATER".
      - kwhUsed: (Number) Total kWh consumed (if Electric).
      - m3Used: (Number) Total m³ consumed (if Water).
      - billingPeriod: (String) Date range.
      - totalAmount: (Number) Total amount due in ₱.
      - effectiveRate: (Number) Calculate exactly: totalAmount / kwhUsed (or m3Used). Round to 4 decimals.
      - billingDate: (String) Due date or bill date.
      ${deepAnalysisInstruction}

      Return ONLY the raw JSON object. Do not wrap in markdown backticks. Do not include any explanations. If a field is missing, return null. Ensure all numerical values are actual numbers.
    `;

    // Extract mime type dynamically (e.g. data:image/png;base64,... or data:application/pdf;base64,...)
    const mimeMatch = image.match(/^data:([a-zA-Z0-9-]+\/[a-zA-Z0-9-.]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const base64Data = image.split(',')[1] || image;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Hardened JSON extraction: pull only the first '{' to the last '}'
    let jsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const startIndex = jsonStr.indexOf('{');
    const endIndex = jsonStr.lastIndexOf('}');
    
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        jsonStr = jsonStr.substring(startIndex, endIndex + 1);
    }
    
    let rawData;
    try {
        rawData = JSON.parse(jsonStr);
    } catch (parseError) {
        throw new Error('AI returned malformed data that could not be parsed: ' + text.substring(0, 50));
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
