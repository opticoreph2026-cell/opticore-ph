import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ─── PDF TEXT EXTRACTION (pdf-parse) ────────────────────
async function extractTextFromPDF(buffer) {
  const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
  
  try {
    const data = await pdfParse(buffer, {
      max: 3,
      pagerender: async function(pageData) {
        const renderOptions = {
          normalizeWhitespace: false,
          disableCombineTextItems: false,
        };
        const textContent = await pageData.getTextContent(renderOptions);
        
        let lastY = null;
        let text = '';
        
        for (const item of textContent.items) {
          if (lastY !== null && lastY !== item.transform[5]) {
            text += '\n';
          }
          text += item.str + ' ';
          lastY = item.transform[5];
        }
        return text;
      }
    });
    
    
    return data.text;
  } catch (parseError) {
    console.error('[Scan API] pdf-parse failed:', parseError.message);
    throw new Error('Could not read PDF. Ensure it is a valid PDF file.');
  }
}

// ─── GEMINI VISION OCR ────────────────────────────────────
async function extractTextWithGemini(mimeType, base64string) {
  try {
    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        {
          parts: [
            {
              text: `You are a utility bill parser for the Philippines. Look at this utility bill image carefully.
This may be a MERALCO, VECO, CEBECO, or DLPC bill.

Extract these exact values and return ONLY a JSON object.
No markdown. No code blocks. No explanation. Just JSON.

{
  "kwhUsed": <total kWh consumed this period, number or null>,
  "totalAmount": <total amount due in Philippine Pesos, number or null>,
  "billingDate": <billing end date in YYYY-MM-DD format or null>,
  "providerName": <utility company name or null>,
  "type": <"electricity" or "water">
}

Lookup guide:
- kwhUsed: find "kWh" label near a number (e.g. 183 kWh)
- totalAmount: find "Amount Due" or "Total Amount Due" (e.g. 1,782.50 → return as 1782.50)
- billingDate: find "Due Date" or billing period end date
- providerName: company name at top (MERALCO, VECO, etc.)
- type: electricity if kWh shown, water if cubic meters shown

IF THE IMAGE IS NOT A PHILIPPINE UTILITY BILL:
Return {"error": "INVALID_IMAGE", "reason": "Not a valid Philippine utility bill"}`
            },
            {
              inlineData: {
                mimeType,
                data: base64string,
              },
            },
          ],
        },
      ],
    });

    const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return rawText;

  } catch (err) {
    console.error('[Scan API] Gemini vision failed:', err.message);
    throw new Error('Gemini scan failed: ' + err.message);
  }
}

// ─── JSON EXTRACTION HELPER ─────────────────────────────
function extractBillJSON(text) {
  try {
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error('Failed to parse Gemini JSON');
  }
}

// ─── REGEX BILL PARSER ──────────────────────────────────
function parseBillText(text) {
  const normalized = text
    .replace(/\s+/g, ' ')
    .replace(/,/g, '')
    .toUpperCase()
    .trim();

  const providers = [
    'MERALCO', 'VECO', 'CEBECO', 'DLPC', 'BENECO',
    'MCWD', 'MANILA WATER', 'MAYNILAD', 'MWSS',
    'CEBU WATER', 'SUBIC WATER'
  ];
  let providerName = null;
  for (const p of providers) {
    if (normalized.includes(p)) {
      providerName = p;
      break;
    }
  }

  const hasCubicMeter = /\d+\.?\d*\s*M[³3]/i.test(text) || 
                        /CU\.?\s*M/i.test(text) ||
                        normalized.includes('CUBIC METER');
  const type = hasCubicMeter ? 'water' : 'electricity';

  let kwhUsed = null;
  if (type === 'electricity') {
    const kwhPatterns = [
      /PRESENT\s+READING[^0-9]*(\d+\.?\d*)/i,
      /KWH\s+CONSUMED[^0-9]*(\d+\.?\d*)/i,
      /CONSUMPTION[^0-9]*(\d+\.?\d*)\s*KWH/i,
      /TOTAL\s+KWH[^0-9]*(\d+\.?\d*)/i,
      /(\d+\.?\d*)\s*KWH/i,
    ];
    for (const pattern of kwhPatterns) {
      const match = text.match(pattern);
      if (match) {
        const val = parseFloat(match[1].replace(',', ''));
        if (val >= 10 && val <= 5000) { kwhUsed = val; break; }
      }
    }
  }

  let totalAmount = null;
  const amountPatterns = [
    /AMOUNT\s+DUE[^0-9]*(\d{1,6}\.?\d{0,2})/i,
    /TOTAL\s+AMOUNT\s+DUE[^0-9]*(\d{1,6}\.?\d{0,2})/i,
    /PLEASE\s+PAY[^0-9]*(\d{1,6}\.?\d{0,2})/i,
    /TOTAL\s+DUE[^0-9]*(\d{1,6}\.?\d{0,2})/i,
  ];
  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match) {
      const val = parseFloat(match[1].replace(',', ''));
      if (val >= 100 && val <= 100000) { totalAmount = val; break; }
    }
  }

  let billingDate = null;
  const MONTHS = { JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06', JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12' };
  const namedMatch = text.match(/(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\.?\s+(\d{1,2}),?\s+(20\d{2})/i);
  if (namedMatch) {
    const month = MONTHS[namedMatch[1].toUpperCase().substring(0, 3)];
    const day = namedMatch[2].padStart(2, '0');
    const year = namedMatch[3];
    billingDate = `${year}-${month}-${day}`;
  }

  let confidence = 0;
  if (providerName) confidence += 20;
  if (totalAmount) confidence += 35;
  if (kwhUsed) confidence += 35;
  if (billingDate) confidence += 10;

  return { kwhUsed, m3Used: null, totalAmount, billingDate, providerName, type, confidence };
}

// ─── MAIN HANDLER ───────────────────────────────────────
export async function POST(req) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type;
    const base64string = buffer.toString('base64');

    let billData = null;

    if (mimeType === 'application/pdf') {
      // PATH 1A: Try pdf-parse first (fast, free)
      try {
        const pdfText = await extractTextFromPDF(buffer);
        if (pdfText && pdfText.trim().length > 50) {
          const parsed = parseBillText(pdfText);
          if (parsed.confidence >= 40) {
            billData = parsed;
          }
        }
      } catch (pdfError) {
        console.warn('[Scan API] pdf-parse failed:', pdfError.message);
      }

      // PATH 1B: Fallback to Gemini Multimodal for complex PDFs
      if (!billData || billData.confidence < 40) {
        try {
          const geminiResponse = await extractTextWithGemini(mimeType, base64string);
          try {
            const directJSON = extractBillJSON(geminiResponse);
            if (directJSON.error === 'INVALID_IMAGE') {
              return NextResponse.json({ error: 'INVALID_IMAGE', message: directJSON.reason }, { status: 422 });
            }
            billData = { ...directJSON, confidence: directJSON.totalAmount ? 95 : 45 };
          } catch {
            billData = parseBillText(geminiResponse);
          }
        } catch (pdfVisionError) {
          console.warn('[Scan API] Gemini PDF vision failed:', pdfVisionError.message);
          return NextResponse.json({
            error: 'PDF_GARBLED',
            message: 'This PDF has a highly complex layout. Please enter values manually or upload a clear image instead.',
          }, { status: 422 });
        }
      }
    } else {
      // PATH 2: Image → always use Gemini vision
      try {
        const geminiResponse = await extractTextWithGemini(mimeType, base64string);
        try {
          const directJSON = extractBillJSON(geminiResponse);
          if (directJSON.error === 'INVALID_IMAGE') {
            return NextResponse.json({ error: 'INVALID_IMAGE', message: directJSON.reason }, { status: 422 });
          }
          billData = { ...directJSON, confidence: directJSON.totalAmount ? 95 : 45 };
        } catch {
          billData = parseBillText(geminiResponse);
        }
      } catch (imageError) {
        return NextResponse.json({ error: 'SCAN_FAILED', message: 'Could not read image.' }, { status: 422 });
      }
    }

    if (!billData || (!billData.totalAmount && !billData.kwhUsed)) {
      return NextResponse.json({
        error: 'LOW_CONFIDENCE',
        message: 'Could not read bill data. Please try again or enter values manually.',
        partial: billData,
      }, { status: 422 });
    }

    // ENFORCE ELECTRICITY-ONLY SCANNING
    if (billData.type === 'water') {
      return NextResponse.json({
        error: 'WATER_BILL_NOT_SUPPORTED',
        message: 'Water bills cannot be scanned. Please enter your water consumption manually in the Water Usage section.',
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        kwhUsed: billData.kwhUsed ?? null,
        totalAmount: billData.totalAmount ?? null,
        billingDate: billData.billingDate ?? null,
        providerName: billData.providerName ?? null,
        type: 'electricity',
        confidence: billData.confidence ?? 0,
      }
    });

  } catch (error) {
    console.error('[Vision OCR] Critical Error:', error);
    return NextResponse.json({ error: 'SCAN_ERROR', message: 'Scan failed.' }, { status: 500 });
  }
}
