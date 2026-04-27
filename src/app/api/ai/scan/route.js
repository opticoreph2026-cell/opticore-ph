import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db as prisma } from '@/lib/db';

// ── Regex extraction engine ──────────────────────────
function extractBillData(rawText) {
  const text = rawText.toUpperCase();

  // Provider detection
  let providerName = null;
  if (text.includes('MERALCO')) providerName = 'MERALCO';
  else if (text.includes('VECO')) providerName = 'VECO';
  else if (text.includes('CEBU ELECTRIC')) providerName = 'VECO';
  else if (text.includes('MCWD')) providerName = 'MCWD';
  else if (text.includes('METRO CEBU WATER')) providerName = 'MCWD';
  else if (text.includes('MANILA WATER')) providerName = 'Manila Water';
  else if (text.includes('MAYNILAD')) providerName = 'Maynilad';

  // Bill type
  const isWater = text.includes('CUBIC METER') || 
                  text.includes('CU.M') || 
                  text.includes('M3') ||
                  text.includes('WATER');
  const type = isWater ? 'water' : 'electricity';

  // kWh extraction (electricity)
  let kwhUsed = null;
  const kwhPatterns = [
    /(\d[\d,]*\.?\d*)\s*KWH/,
    /KWH\s*[:\-]?\s*(\d[\d,]*\.?\d*)/,
    /KILOWATT[- ]HOUR[S]?\s*[:\-]?\s*(\d[\d,]*\.?\d*)/,
    /CONSUMPTION[:\s]*(\d[\d,]*\.?\d*)\s*KWH/,
    /PRESENT\s+READING.*?(\d{4,6})/,
  ];
  for (const pattern of kwhPatterns) {
    const match = rawText.toUpperCase().match(pattern);
    if (match) {
      kwhUsed = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }

  // m³ extraction (water)
  let m3Used = null;
  if (isWater) {
    const m3Patterns = [
      /(\d[\d,]*\.?\d*)\s*(?:CU\.?M|M3|CUBIC)/,
      /CONSUMPTION[:\s]*(\d[\d,]*\.?\d*)/,
      /VOLUME[:\s]*(\d[\d,]*\.?\d*)/,
    ];
    for (const pattern of m3Patterns) {
      const match = rawText.toUpperCase().match(pattern);
      if (match) {
        m3Used = parseFloat(match[1].replace(/,/g, ''));
        break;
      }
    }
  }

  // Total amount extraction
  let totalAmount = null;
  const amountPatterns = [
    /(?:AMOUNT DUE|TOTAL AMOUNT DUE|TOTAL DUE|AMOUNT PAYABLE)[:\s]*(?:PHP|₱)?\s*([\d,]+\.?\d*)/,
    /(?:PHP|₱)\s*([\d,]+\.\d{2})\s*(?:TOTAL|DUE|PAYABLE)/,
    /PLEASE PAY[:\s]*(?:PHP|₱)?\s*([\d,]+\.?\d*)/,
    /TOTAL[:\s]*(?:PHP|₱)?\s*([\d,]+\.\d{2})/,
  ];
  for (const pattern of amountPatterns) {
    const match = rawText.toUpperCase().match(pattern);
    if (match) {
      totalAmount = parseFloat(match[1].replace(/,/g, ''));
      if (totalAmount > 50) break; // ignore suspiciously small amounts
    }
  }

  // Billing date extraction
  let billingDate = null;
  const datePatterns = [
    /(?:BILL(?:ING)?\s+DATE|DUE DATE|READING DATE)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /(\d{1,2})\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*[\s,]+(\d{4})/i,
    /(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s+(\d{1,2}),?\s+(\d{4})/i,
  ];
  for (const pattern of datePatterns) {
    const match = rawText.match(pattern);
    if (match) {
      try {
        const parsed = new Date(match[0].replace(/[A-Z]+:/i, '').trim());
        if (!isNaN(parsed)) {
          billingDate = parsed.toISOString().split('T')[0];
          break;
        }
      } catch {}
    }
  }

  // Confidence score — how many fields were extracted
  const extractedFields = [kwhUsed, m3Used, totalAmount, billingDate, providerName]
    .filter(Boolean).length;
  const confidence = Math.round((extractedFields / 5) * 100);

  return { kwhUsed, m3Used, totalAmount, billingDate, providerName, type, confidence };
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
