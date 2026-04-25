import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { calculateAttribution, calculateWaterAttribution } from '@/utils/attributionEngine';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * GET /api/report
 * Returns the most recent generated report for the user.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const report = await db.aIReport.findFirst({
      where: { clientId: user.sub },
      orderBy: { generatedAt: 'desc' }
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    return NextResponse.json({ error: 'FETCH_ERROR' }, { status: 500 });
  }
}

/**
 * POST /api/report
 * Triggers the Attribution Engine and Gemini to generate a new intelligence report.
 */
export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 1. Data Aggregation
    const [latestReading, appliances] = await Promise.all([
      db.utilityReading.findFirst({
        where: { clientId: user.sub },
        orderBy: { readingDate: 'desc' }
      }),
      db.appliance.findMany({
        where: { clientId: user.sub }
      })
    ]);

    if (!latestReading) {
      return NextResponse.json({ error: 'NO_DATA', message: 'Please submit a utility reading first.' }, { status: 400 });
    }

    // 2. Logic Execution (Dual-Stream Attribution)
    const elecAttribution = calculateAttribution(latestReading.kwhUsed || 0, appliances);
    const waterAttribution = latestReading.m3Used 
      ? calculateWaterAttribution(latestReading.m3Used, 4) // Default 4 members if unknown
      : null;

    // 3. AI Narrative Generation
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an expert Energy & Water Audit AI for OptiCore PH. 
      Analyze these actual engineering results for a Philippine household and provide a professional, unified intelligence summary.
      
      ELECTRIC DIAGNOSTICS:
      - Total consumption: ${elecAttribution.actual} kWh
      - Theoretical expected: ${elecAttribution.totalEstimated} kWh
      - Discrepancy (Ghost Load): ${elecAttribution.discrepancy.value} kWh (${elecAttribution.discrepancy.percentage}%)
      - Severity: ${elecAttribution.severity}

      WATER DIAGNOSTICS:
      ${waterAttribution ? `
      - Total consumption: ${waterAttribution.actual} m³
      - Theoretical expected: ${waterAttribution.totalEstimated} m³
      - Discrepancy (Leakage): ${waterAttribution.discrepancy.value} m³ (${waterAttribution.discrepancy.percentage}%)
      - Severity: ${waterAttribution.severity}
      ` : 'No water data provided.'}

      TONE: Industrial, precise, and highly actionable.
      REQUIREMENT: Provide a 3-sentence summary and 3 bulleted ROI recommendations. 
      Format for a dashboard quote-block.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    // 4. Persistence
    // Compute effective rate: prefer stored value, fallback to bill/kWh, then PH baseline
    const effectiveRatePhp: number =
      latestReading.effectiveRate ??
      (latestReading.kwhUsed > 0 && latestReading.billAmountElectric > 0
        ? latestReading.billAmountElectric / latestReading.kwhUsed
        : 11.5); // Cebu VECO baseline ₱/kWh

    // Monthly savings = ghost-load kWh × rate × 12 months for annual figure
    const estimatedMonthlySavings = elecAttribution.discrepancy.value * effectiveRatePhp;

    const newReport = await db.aIReport.create({
      data: {
        clientId: user.sub,
        summary,
        recommendations: JSON.stringify({
          electric: elecAttribution,
          water: waterAttribution,
          effectiveRateUsed: effectiveRatePhp,
        }),
        estimatedSavings: Math.round(estimatedMonthlySavings * 100) / 100, // Monthly ₱ savings
      },
    });

    return NextResponse.json({ success: true, report: newReport });

  } catch (error) {
    console.error('[API Report] Generation Error:', error);
    if (error.status === 429) {
      return NextResponse.json({ error: 'AI_LIMIT', message: 'Service busy.' }, { status: 429 });
    }
    return NextResponse.json({ error: 'GEN_ERROR' }, { status: 500 });
  }
}
