import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// ─── PDF TEXT EXTRACTION ────────────────────────────────
async function extractTextFromPDF(buffer) {
  // Dynamic import to avoid SSR issues
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  
  const bytes = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data: bytes });
  const pdf = await loadingTask.promise;
  
  let fullText = '';
  
  // Extract text from all pages with position data
  for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 3); pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Sort text items by vertical position (y), then horizontal (x)
    // This reconstructs reading order for multi-column layouts
    const items = textContent.items
      .filter(item => item.str && item.str.trim())
      .map(item => ({
        str: item.str,
        x: Math.round(item.transform[4]),
        y: Math.round(item.transform[5]),
      }))
      .sort((a, b) => {
        // Group into rows (within 5px vertical tolerance)
        const yDiff = b.y - a.y;
        if (Math.abs(yDiff) > 5) return yDiff;
        return a.x - b.x;
      });
    
    // Build text preserving spatial structure
    let lastY = null;
    for (const item of items) {
      if (lastY !== null && Math.abs(item.y - lastY) > 5) {
        fullText += '\n';
      }
      fullText += item.str + ' ';
      lastY = item.y;
    }
    fullText += '\n\n';
  }
  
  console.log('[Scan API] PDF text extracted, length:', fullText.length);
  console.log('[Scan API] Text sample:', fullText.substring(0, 300));
  return fullText;
}

// ─── IMAGE OCR EXTRACTION ───────────────────────────────
async function extractTextFromImage(buffer) {
  const { createWorker } = await import('tesseract.js');
  
  const worker = await createWorker('eng', 1, {
    logger: () => {}, // silence progress logs
  });
  
  const { data: { text } } = await worker.recognize(buffer);
  await worker.terminate();
  
  console.log('[Scan API] OCR text extracted, length:', text.length);
  console.log('[Scan API] OCR sample:', text.substring(0, 300));
  return text;
}

// ─── REGEX BILL PARSER ──────────────────────────────────
// Handles Philippine utility bills: MERALCO, VECO, CEBECO, 
// MCWD, Manila Water, DLPC, etc.

function parseBillText(text) {
  const normalized = text
    .replace(/\s+/g, ' ')
    .replace(/,/g, '')  // remove thousand separators for number parsing
    .toUpperCase()
    .trim();

  console.log('[Scan API] Normalized text sample:', normalized.substring(0, 500));

  // ── Provider detection ────────────────────────────────
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

  // ── Utility type detection ────────────────────────────
  const hasKwh = /\d+\.?\d*\s*KWH/i.test(text);
  const hasCubicMeter = /\d+\.?\d*\s*M[³3]/i.test(text) || 
                        /CU\.?\s*M/i.test(text) ||
                        normalized.includes('CUBIC METER');
  const type = hasCubicMeter ? 'water' : 'electricity';

  // ── kWh extraction ────────────────────────────────────
  let kwhUsed = null;
  if (type === 'electricity') {
    const kwhPatterns = [
      /PRESENT\s+READING[^0-9]*(\d+\.?\d*)/i,
      /KWH\s+CONSUMED[^0-9]*(\d+\.?\d*)/i,
      /CONSUMPTION[^0-9]*(\d+\.?\d*)\s*KWH/i,
      /TOTAL\s+KWH[^0-9]*(\d+\.?\d*)/i,
      /(\d+\.?\d*)\s*KWH/i,
      /ENERGY\s+CHARGE[^0-9]*(\d+)/i,
    ];
    
    for (const pattern of kwhPatterns) {
      const match = text.match(pattern);
      if (match) {
        const val = parseFloat(match[1].replace(',', ''));
        // Sanity check: kWh for household should be 10-5000
        if (val >= 10 && val <= 5000) {
          kwhUsed = val;
          break;
        }
      }
    }
  }

  // ── Water m³ extraction ───────────────────────────────
  let m3Used = null;
  if (type === 'water') {
    const m3Patterns = [
      /CONSUMPTION[^0-9]*(\d+\.?\d*)\s*M/i,
      /(\d+\.?\d*)\s*M[³3]/i,
      /(\d+\.?\d*)\s*CU\.?\s*M/i,
      /VOLUME\s+USED[^0-9]*(\d+)/i,
    ];
    
    for (const pattern of m3Patterns) {
      const match = text.match(pattern);
      if (match) {
        const val = parseFloat(match[1].replace(',', ''));
        if (val >= 1 && val <= 1000) {
          m3Used = val;
          break;
        }
      }
    }
  }

  // ── Total amount extraction ───────────────────────────
  let totalAmount = null;
  const amountPatterns = [
    /AMOUNT\s+DUE[^0-9]*(\d{1,6}\.?\d{0,2})/i,
    /TOTAL\s+AMOUNT\s+DUE[^0-9]*(\d{1,6}\.?\d{0,2})/i,
    /PLEASE\s+PAY[^0-9]*(\d{1,6}\.?\d{0,2})/i,
    /TOTAL\s+DUE[^0-9]*(\d{1,6}\.?\d{0,2})/i,
    /CURRENT\s+CHARGES[^0-9]*(\d{1,6}\.?\d{0,2})/i,
    /BILLING\s+AMOUNT[^0-9]*(\d{1,6}\.?\d{0,2})/i,
    /NET\s+AMOUNT[^0-9]*(\d{1,6}\.?\d{0,2})/i,
  ];
  
  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match) {
      const val = parseFloat(match[1].replace(',', ''));
      // Sanity check: Philippine utility bill ₱100-₱100,000
      if (val >= 100 && val <= 100000) {
        totalAmount = val;
        break;
      }
    }
  }

  // ── Billing date extraction ───────────────────────────
  let billingDate = null;
  const datePatterns = [
    // DD/MM/YYYY or MM/DD/YYYY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](20\d{2})/g,
    // Month DD, YYYY
    /(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\.?\s+(\d{1,2}),?\s+(20\d{2})/gi,
    // YYYY-MM-DD
    /(20\d{2})[\/\-](\d{1,2})[\/\-](\d{1,2})/g,
  ];
  
  const monthMap = {
    JAN: '01', FEB: '02', MAR: '03', APR: '04',
    MAY: '05', JUN: '06', JUL: '07', AUG: '08',
    SEP: '09', OCT: '10', NOV: '11', DEC: '12'
  };
  
  // Try named month pattern first (most reliable)
  const namedMatch = text.match(
    /(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\.?\s+(\d{1,2}),?\s+(20\d{2})/i
  );
  if (namedMatch) {
    const month = monthMap[namedMatch[1].toUpperCase().substring(0, 3)];
    const day = namedMatch[2].padStart(2, '0');
    const year = namedMatch[3];
    billingDate = `${year}-${month}-${day}`;
  }
  
  // Try numeric date if named failed
  if (!billingDate) {
    const numMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](20\d{2})/);
    if (numMatch) {
      // Assume MM/DD/YYYY for Philippine bills
      const month = numMatch[1].padStart(2, '0');
      const day = numMatch[2].padStart(2, '0');
      const year = numMatch[3];
      // Validate
      if (parseInt(month) <= 12 && parseInt(day) <= 31) {
        billingDate = `${year}-${month}-${day}`;
      }
    }
  }

  // ── Confidence calculation ────────────────────────────
  let confidence = 0;
  if (providerName) confidence += 20;
  if (totalAmount) confidence += 35;
  if (kwhUsed || m3Used) confidence += 35;
  if (billingDate) confidence += 10;

  const result = {
    kwhUsed: kwhUsed ?? null,
    m3Used: m3Used ?? null,
    totalAmount: totalAmount ?? null,
    billingDate: billingDate ?? null,
    providerName: providerName ?? null,
    type,
    confidence,
  };

  console.log('[Scan API] Parsed result:', result);
  return result;
}

// ─── MAIN HANDLER ───────────────────────────────────────
export async function POST(req) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' }, { status: 400 }
      );
    }

    // Size check
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File must be under 8MB.' }, { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type;

    // Extract text based on file type
    let extractedText = '';
    if (mimeType === 'application/pdf') {
      extractedText = await extractTextFromPDF(buffer);
    } else {
      extractedText = await extractTextFromImage(buffer);
    }

    if (!extractedText || extractedText.trim().length < 20) {
      return NextResponse.json({
        error: 'EXTRACTION_FAILED',
        message: 'Could not extract text from this file. ' +
          'For PDFs: ensure it contains selectable text (not a scanned image). ' +
          'For images: ensure the photo is clear and well-lit.'
      }, { status: 422 });
    }

    // Parse bill fields from extracted text
    const billData = parseBillText(extractedText);

    if (billData.confidence < 30) {
      return NextResponse.json({
        error: 'LOW_CONFIDENCE',
        message: 'Could not reliably read this bill. ' +
          'Found: ' + (billData.providerName || 'unknown provider') + '. ' +
          'Please ensure the total amount and kWh are clearly visible, ' +
          'or enter the values manually.',
        partial: billData, // Return what we found so user can correct
      }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      kwhUsed: billData.kwhUsed,
      m3Used: billData.m3Used,
      totalAmount: billData.totalAmount,
      billingDate: billData.billingDate,
      providerName: billData.providerName,
      type: billData.type,
      confidence: billData.confidence,
    });

  } catch (error) {
    console.error('[Vision OCR] Critical Error:', error);
    return NextResponse.json({
      error: 'SCAN_ERROR',
      message: 'Scan failed. Please try again or enter values manually.',
    }, { status: 500 });
  }
}
