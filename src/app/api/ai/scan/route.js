import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db as prisma } from '@/lib/db';
import { extractText } from 'unpdf';

// ── Regex extraction engine ──────────────────────────
function extractBillData(rawText) {
  // ── Step 1: Deduplicate doubled characters ─────────
  // This PDF has two overlapping text layers. Every character
  // appears twice: "kk WW hh" = "kWh", "11 88 33" = "183"
  // Fix: collapse any character immediately repeated (with 
  // optional space between) into a single character.

  let deduped = rawText
    // Collapse doubled chars with space: "k k" → "k", "1 1" → "1"
    .replace(/(\S) \1/g, '$1')
    // Collapse directly doubled chars: "kk" → "k", "11" → "1"  
    .replace(/(.)\1+/g, '$1')
    // Now collapse whitespace
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();

  // ── Step 2: Collapse remaining character-spaced words ─
  // After dedup, some words may still be space-separated chars
  // "k W h" → "kWh", "M E R A L C O" → "MERALCO"
  function collapseSpacedText(text) {
    const lines = text.split('\n');
    return lines.map(line => {
      const tokens = line.trim().split(' ');
      if (tokens.length < 3) return line;
      let result = '';
      let i = 0;
      while (i < tokens.length) {
        let runEnd = i;
        while (runEnd < tokens.length && tokens[runEnd].length === 1) {
          runEnd++;
        }
        if (runEnd - i >= 3) {
          result += tokens.slice(i, runEnd).join('') + ' ';
          i = runEnd;
        } else {
          result += tokens[i] + ' ';
          i++;
        }
      }
      return result.trim();
    }).join('\n');
  }

  const normalized = collapseSpacedText(deduped);
  const upper = normalized.toUpperCase();
  const spaceless = upper.replace(/\s+/g, '');

  console.log('[Scan API] Normalized sample:', normalized.substring(0, 300));

  // ── Step 3: Provider detection ───────────────────────
  let providerName = null;
  if (upper.includes('MERALCO')) providerName = 'MERALCO';
  else if (upper.includes('VECO')) providerName = 'VECO';
  else if (upper.includes('CEBU ELECTRIC')) providerName = 'VECO';
  else if (upper.includes('MCWD')) providerName = 'MCWD';
  else if (upper.includes('METRO CEBU WATER')) providerName = 'MCWD';
  else if (upper.includes('MANILA WATER')) providerName = 'Manila Water';
  else if (upper.includes('MAYNILAD')) providerName = 'Maynilad';

  // ── Step 4: Bill type ────────────────────────────────
  const isWater = upper.includes('CUBIC METER') ||
                  upper.includes('CU.M') ||
                  spaceless.includes('CUBICMETER') ||
                  (upper.includes('WATER') && !upper.includes('WATERMARK') &&
                   !upper.includes('MERALCO'));
  const type = isWater ? 'water' : 'electricity';

  // ── Step 5: kWh extraction ───────────────────────────
  // Target: "183 kWh" or "183kWh" or "183 KWH"
  // Also: metering info line "183 kWh" appears multiple times
  let kwhUsed = null;
  const kwhPatterns = [
    // Direct: 183 kWh
    /(\d{2,6})\s*KWH/i,
    // Labeled consumption
    /CONSUMPTION[:\s]*(\d{2,6})\s*KWH/i,
    // Electricity Used label (Meralco specific)
    /ELECTRICITY\s*USE[D]?\s*(\d{2,6})/i,
    // Metering info: "183 kWh" after meter reading numbers
    /\b(\d{3,4})\s+KWH\b/i,
    // After kWh label
    /KWH\s*[:\-]?\s*(\d{2,6})/i,
  ];
  for (const pattern of kwhPatterns) {
    const match = upper.match(pattern);
    if (match) {
      const val = parseFloat(match[1].replace(/,/g, ''));
      // Sanity check: typical Philippine residential bill 1-9999 kWh
      if (val >= 1 && val <= 9999) {
        kwhUsed = val;
        break;
      }
    }
  }

  // ── Step 6: m³ extraction (water bills) ─────────────
  let m3Used = null;
  if (isWater) {
    const m3Patterns = [
      /(\d{1,5}\.?\d*)\s*(?:CU\.?M|M3|CUBIC\s*METER)/i,
      /CONSUMPTION[:\s]*(\d{1,5}\.?\d*)/i,
      /VOLUME[:\s]*(\d{1,5}\.?\d*)/i,
    ];
    for (const pattern of m3Patterns) {
      const match = upper.match(pattern);
      if (match) {
        const val = parseFloat(match[1].replace(/,/g, ''));
        if (val >= 1 && val <= 9999) { m3Used = val; break; }
      }
    }
  }

  // ── Step 7: Total amount extraction ─────────────────
  // Target: "Total Amount Due ₱ 2,179.63" or "Please Pay 2,179.63"
  // Meralco uses "Charges for this billing period ₱ 2,179.63"
  let totalAmount = null;
  const amountPatterns = [
    // Most reliable: "Total Amount Due" label — Meralco standard
    /TOTAL\s+AMOUNT\s+DUE\s*[₱P]?\s*([\d,]+\.?\d*)/i,
    // "Please Pay" section on payment stub
    /PLEASE\s+PAY\s*[₱P]?\s*([\d,]+\.\d{2})/i,
    // "Charges for this billing period"
    /CHARGES\s+FOR\s+THIS\s+BILL[A-Z\s]*\s*[₱P]?\s*([\d,]+\.?\d*)/i,
    // Amount Due generic
    /AMOUNT\s+DUE\s*[₱P]?\s*([\d,]+\.?\d*)/i,
    // ₱ or P followed by 4+ digit amount with decimal
    /[₱P]\s*([\d,]{4,}\.?\d*)/,
    // Spaceless fallback: TOTALAMOUNTDUE followed by number
    /TOTALAMOUNTDUE\s*[₱P]?\s*([\d,]+\.?\d*)/i,
  ];
  for (const pattern of amountPatterns) {
    const match = upper.match(pattern);
    if (match) {
      const val = parseFloat(match[1].replace(/,/g, ''));
      // Sanity: Philippine bill between ₱50 and ₱999,999
      if (val >= 50 && val <= 999999) {
        totalAmount = val;
        break;
      }
    }
  }

  // ── Step 8: Billing date extraction ─────────────────
  // Target: "Billing Period: 11 Dec 2024 to 10 Jan 2025"
  // We want the END date (10 Jan 2025 = due date)
  let billingDate = null;
  const MONTHS = {
    JAN:1,FEB:2,MAR:3,APR:4,MAY:5,JUN:6,
    JUL:7,AUG:8,SEP:9,OCT:10,NOV:11,DEC:12
  };

  // Pattern 1: "DD Mon YYYY to DD Mon YYYY" — capture the TO date
  const periodPattern = /(\d{1,2})\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s+(\d{4})\s+TO\s+(\d{1,2})\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s+(\d{4})/i;
  const periodMatch = upper.match(periodPattern);
  if (periodMatch) {
    const day = parseInt(periodMatch[4]);
    const month = MONTHS[periodMatch[5].substring(0,3).toUpperCase()];
    const year = parseInt(periodMatch[6]);
    if (year >= 2020 && year <= 2030) {
      billingDate = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    }
  }

  // Pattern 2: Single date near "Bill Date" / "Due Date" label
  if (!billingDate) {
    const singleDatePattern = /(?:BILL\s*DATE|DUE\s*DATE|BILLING\s*DATE)\s*[:\-]?\s*(\d{1,2})\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s+(\d{4})/i;
    const singleMatch = upper.match(singleDatePattern);
    if (singleMatch) {
      const day = parseInt(singleMatch[1]);
      const month = MONTHS[singleMatch[2].substring(0,3).toUpperCase()];
      const year = parseInt(singleMatch[3]);
      if (year >= 2020 && year <= 2030) {
        billingDate = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      }
    }
  }

  // Pattern 3: DD/MM/YYYY or MM/DD/YYYY numeric fallback
  if (!billingDate) {
    const numericDate = upper.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
    if (numericDate) {
      const a = parseInt(numericDate[1]);
      const b = parseInt(numericDate[2]);
      const year = parseInt(numericDate[3]);
      if (year >= 2020 && year <= 2030) {
        // Assume MM/DD/YYYY for Philippine bills
        billingDate = `${year}-${String(a).padStart(2,'0')}-${String(b).padStart(2,'0')}`;
      }
    }
  }

  // ── Step 9: Confidence score ─────────────────────────
  const fields = [kwhUsed ?? m3Used, totalAmount, billingDate, providerName];
  const extracted = fields.filter(Boolean).length;
  const confidence = Math.round((extracted / 4) * 100);

  console.log('[Scan API] Extracted:', { kwhUsed, m3Used, totalAmount, billingDate, providerName, type, confidence });

  if (confidence < 40) {
    console.log('[Scan API] Low confidence debug — normalized text:',
      normalized.substring(0, 500));
  }

  return { kwhUsed, m3Used, totalAmount, billingDate, providerName, type, confidence };
}

// ── PDF extraction ───────────────────────────────────
async function extractFromPDF(buffer) {
  const uint8 = new Uint8Array(buffer);
  const { text } = await extractText(uint8, { mergePages: true });
  console.log('[Scan API] unpdf extracted, chars:', text.length);
  console.log('[Scan API] Text sample:', text.substring(0, 300));
  return extractBillData(text);
}

// ── Main POST handler logic ──────────────────────────
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const client = await prisma.client.findUnique({ where: { id: user.sub } });
    if (!client) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const plan = client.planTier ?? 'starter';

    if (plan === 'starter') {
      const now = new Date();
      if (client.lastScanReset && (now - new Date(client.lastScanReset)) > 30 * 24 * 60 * 60 * 1000) {
        await prisma.client.update({
          where: { id: client.id },
          data: { scanCount: 0, lastScanReset: new Date() }
        });
        client.scanCount = 0;
      }
      if (client.scanCount >= 1) {
        return NextResponse.json(
          { error: 'QUOTA_EXCEEDED', message: 'You have reached your 1 free AI scan limit. Upgrade to Pro for unlimited scans and deep analysis.' },
          { status: 403 }
        );
      }
    }

    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type;

    let result;
    try {
      if (mimeType === 'application/pdf') {
        result = await extractFromPDF(buffer);
      } else if (mimeType.startsWith('image/')) {
        console.log('[Scan API] Image upload — returning manual entry prompt');
        return NextResponse.json({
          kwhUsed: null,
          totalAmount: null,
          billingDate: null,
          providerName: null,
          type: 'electricity',
          confidence: 0,
          warning: 'Image scanning is not supported. Please upload a PDF ' +
                   'version of your bill, or enter your details manually below.'
        });
      } else {
        return NextResponse.json(
          { error: 'Unsupported file type. Upload a PDF or image.' },
          { status: 400 }
        );
      }
    } catch (err) {
      console.error('[Scan API] Extraction failed:', err.message);
      return NextResponse.json(
        { error: 'Could not read this file. Please try manual entry.' },
        { status: 422 }
      );
    }

    // Warn frontend if confidence is low
    if (result.confidence < 40) {
      result.warning = 'Low confidence extraction. Please verify all fields before submitting.';
    }

    console.log(`[Scan API] Extraction complete. Confidence: ${result.confidence}%`);
    return NextResponse.json(result);

  } catch (error) {
    console.error('[Scan API] Global Error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'System failure during extraction' },
      { status: 500 }
    );
  }
}
