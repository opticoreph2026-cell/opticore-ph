import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db as prisma } from '@/lib/db';

// ── Regex extraction engine ──────────────────────────
function extractBillData(rawText) {
  // Normalize: collapse all whitespace variants, 
  // but also create a spaceless version for concatenated text
  const text = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
  
  const upper = text.toUpperCase();
  // Spaceless version catches concatenated tokens like "MERALCO123KWH"
  const spaceless = upper.replace(/\s+/g, '');

  // ── Provider detection ──────────────────────────────
  let providerName = null;
  if (upper.includes('MERALCO')) providerName = 'MERALCO';
  else if (upper.includes('VECO')) providerName = 'VECO';
  else if (upper.includes('CEBUELECTRIC')) providerName = 'VECO';
  else if (upper.includes('MCWD')) providerName = 'MCWD';
  else if (upper.includes('METROCEBUWATER')) providerName = 'MCWD';
  else if (upper.includes('MANILAWATER')) providerName = 'Manila Water';
  else if (upper.includes('MAYNILAD')) providerName = 'Maynilad';

  // ── Bill type ───────────────────────────────────────
  const isWater = upper.includes('CUBICMETER') ||
                  upper.includes('CUBIC METER') ||
                  spaceless.includes('CUM') ||
                  upper.includes('M3') ||
                  (upper.includes('WATER') && !upper.includes('WATERMARK'));
  const type = isWater ? 'water' : 'electricity';

  // ── kWh extraction ──────────────────────────────────
  let kwhUsed = null;
  const kwhPatterns = [
    // Standard spaced: 350 KWH or 350KWH
    /(\d[\d,]*\.?\d*)\s*KWH/i,
    // Label before: KWH: 350 or KWH 350
    /KWH\s*[:\-]?\s*(\d[\d,]*\.?\d*)/i,
    // Consumption label
    /CONSUMPTION\s*[:\-]?\s*(\d[\d,]*\.?\d*)\s*KWH/i,
    // Concatenated: TOTALCONSUMPTION350KWH
    /CONSUMPTION(\d[\d,]*\.?\d*)KWH/i,
    // Electric usage label
    /ELECTRICUSAGE\s*[:\-]?\s*(\d[\d,]*\.?\d*)/i,
    // kWh anywhere near a 3-6 digit number
    /(\d{3,6})\s*KWH/i,
    // Present/Previous reading difference
    /(?:PRESENT|CURRENT)READING\D{0,20}?(\d{4,7})/i,
  ];
  for (const pattern of kwhPatterns) {
    const match = upper.match(pattern);
    if (match) {
      const val = parseFloat(match[1].replace(/,/g, ''));
      if (val > 0 && val < 99999) { kwhUsed = val; break; }
    }
  }

  // ── m³ extraction ───────────────────────────────────
  let m3Used = null;
  if (isWater) {
    const m3Patterns = [
      /(\d[\d,]*\.?\d*)\s*(?:CU\.?M|M3|CUBIC)/i,
      /CONSUMPTION\s*[:\-]?\s*(\d[\d,]*\.?\d*)/i,
      /VOLUME\s*[:\-]?\s*(\d[\d,]*\.?\d*)/i,
      /WATERUSED\s*[:\-]?\s*(\d[\d,]*\.?\d*)/i,
      /(\d{1,4})\s*CUM/i,
    ];
    for (const pattern of m3Patterns) {
      const match = upper.match(pattern);
      if (match) {
        const val = parseFloat(match[1].replace(/,/g, ''));
        if (val > 0 && val < 9999) { m3Used = val; break; }
      }
    }
  }

  // ── Total amount extraction ─────────────────────────
  let totalAmount = null;
  const amountPatterns = [
    // Most specific first — labeled amount due
    /AMOUNT\s*DUE\s*[:\-]?\s*(?:PHP|₱)?\s*([\d,]+\.?\d*)/i,
    /TOTAL\s*AMOUNT\s*DUE\s*[:\-]?\s*(?:PHP|₱)?\s*([\d,]+\.?\d*)/i,
    /PLEASE\s*PAY\s*[:\-]?\s*(?:PHP|₱)?\s*([\d,]+\.?\d*)/i,
    /AMOUNTDUE\s*(?:PHP|₱)?\s*([\d,]+\.?\d*)/i,
    /TOTALDUE\s*(?:PHP|₱)?\s*([\d,]+\.?\d*)/i,
    // PHP/₱ followed by amount
    /(?:PHP|₱)\s*([\d,]+\.\d{2})/i,
    // Amount payable
    /(?:AMOUNT|TOTAL)\s*PAYABLE\s*[:\-]?\s*(?:PHP|₱)?\s*([\d,]+\.?\d*)/i,
    // Concatenated: AMOUNTDUE1234.56
    /AMOUNTDUE([\d,]+\.?\d*)/i,
    // Total followed by PHP amount (3+ digits + decimal)
    /TOTAL\s*(?:PHP|₱)?\s*([\d,]{3,}\.?\d*)/i,
  ];
  for (const pattern of amountPatterns) {
    const match = upper.match(pattern);
    if (match) {
      const val = parseFloat(match[1].replace(/,/g, ''));
      if (val > 50 && val < 999999) { totalAmount = val; break; }
    }
  }

  // ── Billing date extraction ─────────────────────────
  let billingDate = null;
  const MONTHS = {
    JAN:0,FEB:1,MAR:2,APR:3,MAY:4,JUN:5,
    JUL:6,AUG:7,SEP:8,OCT:9,NOV:10,DEC:11
  };
  const datePatterns = [
    // BILLING DATE: 03/15/2025 or 03-15-2025
    /(?:BILLING|BILL|DUE|READING)\s*DATE\s*[:\-]?\s*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i,
    // 15 MAR 2025 or MAR 15 2025
    /(\d{1,2})\s*(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*[\s,]+(\d{4})/i,
    /(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*[\s\.\-]+(\d{1,2})[\s\,]+(\d{4})/i,
    // Concatenated: BILLINGDATE03152025
    /BILLINGDATE(\d{2})(\d{2})(\d{4})/i,
    // YYYY-MM-DD
    /(\d{4})[\/\-](\d{2})[\/\-](\d{2})/,
  ];
  for (const pattern of datePatterns) {
    const match = upper.match(pattern);
    if (match) {
      try {
        let year, month, day;
        const m = match;
        // Check if match[2] is a month name
        if (m[2] && isNaN(m[2]) && MONTHS[m[2].substring(0,3)] !== undefined) {
          day = parseInt(m[1]);
          month = MONTHS[m[2].substring(0,3)];
          year = parseInt(m[3]);
        } else if (m[1] && isNaN(m[1]) && MONTHS[m[1].substring(0,3)] !== undefined) {
          month = MONTHS[m[1].substring(0,3)];
          day = parseInt(m[2]);
          year = parseInt(m[3]);
        } else {
          // Numeric: assume MM/DD/YYYY or YYYY/MM/DD
          const a = parseInt(m[1]), b = parseInt(m[2]), c = parseInt(m[3]);
          if (a > 31) { year=a; month=b-1; day=c; }
          else { month=a-1; day=b; year=c < 100 ? 2000+c : c; }
        }
        if (year >= 2020 && year <= 2030 && month >= 0 && day >= 1) {
          const d = new Date(year, month, day);
          billingDate = d.toISOString().split('T')[0];
          break;
        }
      } catch {}
    }
  }

  // ── Confidence score ────────────────────────────────
  const fields = [kwhUsed ?? m3Used, totalAmount, billingDate, providerName];
  const extracted = fields.filter(Boolean).length;
  const confidence = Math.round((extracted / 4) * 100);

  if (confidence < 40) {
    console.log('[Scan API] Low confidence. Text sample for debug:', 
      upper.substring(0, 300));
  }

  return { 
    kwhUsed, m3Used, totalAmount, billingDate, 
    providerName, type, confidence 
  };
}

// ── Raw PDF buffer extraction ─────────────────────────
function extractTextFromPDFBuffer(buffer) {
  // Convert buffer to string preserving latin chars
  const raw = buffer.toString('latin1');
  
  const textChunks = [];

  // Extract text from BT...ET blocks (PDF text objects)
  const btEtRegex = /BT[\s\S]*?ET/g;
  let block;
  while ((block = btEtRegex.exec(raw)) !== null) {
    // Extract string literals: (Hello World)
    const parenRegex = /\(([^)]*)\)/g;
    let match;
    while ((match = parenRegex.exec(block[0])) !== null) {
      const text = match[1]
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\\\/g, '\\')
        .replace(/\\([0-7]{3})/g, (_, oct) => 
          String.fromCharCode(parseInt(oct, 8))
        )
        .trim();
      if (text.length > 0) textChunks.push(text);
    }

    // Extract hex strings: <48656c6c6f>
    const hexRegex = /<([0-9a-fA-F]+)>/g;
    while ((match = hexRegex.exec(block[0])) !== null) {
      const hex = match[1];
      if (hex.length % 2 === 0) {
        let text = '';
        for (let i = 0; i < hex.length; i += 2) {
          const code = parseInt(hex.substr(i, 2), 16);
          if (code > 31 && code < 127) text += String.fromCharCode(code);
        }
        if (text.length > 1) textChunks.push(text);
      }
    }
  }

  // Also scan for plain readable strings outside BT/ET 
  // (some PDFs embed text differently)
  if (textChunks.length < 10) {
    const readable = raw.match(/[\x20-\x7E]{4,}/g) || [];
    textChunks.push(...readable.filter(s => /[a-zA-Z]{2,}/.test(s)));
  }

  const fullText = textChunks.join(' ');
  console.log('[Scan API] Raw PDF extraction, chars:', fullText.length);
  return fullText;
}

async function extractFromPDF(buffer) {
  const text = extractTextFromPDFBuffer(buffer);
  console.log('[Scan API] Text sample:', text.substring(0, 500));
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
