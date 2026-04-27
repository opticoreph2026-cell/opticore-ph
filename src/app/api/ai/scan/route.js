import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY 
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
    
    console.log('[Scan API] pdf-parse extracted, chars:', data.text.length);
    return data.text;
  } catch (parseError) {
    console.error('[Scan API] pdf-parse failed:', parseError.message);
    throw new Error('Could not read PDF. Ensure it is a valid PDF file.');
  }
}

// ─── GEMINI VISION OCR ──────────────────────────────────
async function extractTextWithGemini(mimeType, base64string) {
  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64string,
              }
            },
            {
              text: `Read this Philippine utility bill carefully.
Extract ONLY these specific values and return ONLY 
a JSON object. No markdown, no explanation, just JSON.

{
  "kwhUsed": <the total kWh consumed this period, number or null>,
  "totalAmount": <total amount due in pesos, number or null>,
  "billingDate": <billing period end date YYYY-MM-DD or null>,
  "providerName": <utility company name string or null>,
  "type": <"electricity" or "water">
}

For MERALCO bills specifically:
- kwhUsed is labeled "kWh" near the consumption summary
- totalAmount is labeled "Amount Due" or "Total Amount Due"
- providerName is "MERALCO"

Return ONLY the JSON object.`
            }
          ]
        }
      ]
    });

    const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('[Scan API] Gemini OCR response:', rawText.substring(0, 300));
    return rawText;
  } catch (geminiError) {
    console.error('[Scan API] Gemini OCR failed:', geminiError.message);
    throw new Error('Visual scan failed: ' + geminiError.message);
  }
}

// ─── JSON EXTRACTION HELPER ─────────────────────────────
function extractBillJSON(text) {
  try {
    // Attempt to clean markdown backticks if present
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
          console.log('[Scan API] pdf-parse confidence:', parsed.confidence);
          if (parsed.confidence >= 40) {
            billData = parsed;
          }
        }
      } catch (pdfError) {
        console.warn('[Scan API] pdf-parse failed:', pdfError.message);
      }

      // PATH 1B: Fallback to Gemini vision
      if (!billData || billData.confidence < 40) {
        console.log('[Scan API] Low confidence or failure from pdf-parse, switching to Gemini vision OCR');
        try {
          const geminiResponse = await extractTextWithGemini(mimeType, base64string);
          try {
            const directJSON = extractBillJSON(geminiResponse);
            billData = { ...directJSON, confidence: directJSON.totalAmount ? 95 : 40 };
            console.log('[Scan API] Gemini vision parsed directly:', billData);
          } catch {
            billData = parseBillText(geminiResponse);
            console.log('[Scan API] Gemini text parsed via regex:', billData);
          }
        } catch (geminiError) {
          console.error('[Scan API] Gemini vision also failed:', geminiError.message);
        }
      }
    } else {
      // PATH 2: Image → always use Gemini vision
      console.log('[Scan API] Image file, using Gemini vision OCR');
      try {
        const geminiResponse = await extractTextWithGemini(mimeType, base64string);
        try {
          const directJSON = extractBillJSON(geminiResponse);
          billData = { ...directJSON, confidence: directJSON.totalAmount ? 95 : 40 };
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

    return NextResponse.json({
      success: true,
      ...billData
    });

  } catch (error) {
    console.error('[Vision OCR] Critical Error:', error);
    return NextResponse.json({ error: 'SCAN_ERROR', message: 'Scan failed.' }, { status: 500 });
  }
}
