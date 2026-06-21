import 'server-only';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { canAccessCrm } from '@/lib/energy-auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !canAccessCrm(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      designId,
      rateScheduleId,
      capexTotalCentavos,
      omAnnualCostCentavos,
      financingType,
      loanPrincipalCentavos,
      loanAnnualInterestRatePct,
      loanTermMonths,
      selfConsumptionPct,
      annualDegradationPct,
      annualRateEscalationPct,
      cashFlowProjection, // JSON string
      headlineMetrics, // JSON string
      status,
    } = body;

    if (!designId) {
      return NextResponse.json({ error: 'designId is required' }, { status: 400 });
    }

    const roi = await db.rOIComputation.create({
      data: {
        designId,
        rateScheduleId,
        capexTotalCentavos: capexTotalCentavos || 0,
        omAnnualCostCentavos: omAnnualCostCentavos || 0,
        financingType: financingType || 'cash',
        loanPrincipalCentavos: loanPrincipalCentavos || 0,
        loanAnnualInterestRatePct: loanAnnualInterestRatePct || 0,
        loanTermMonths: loanTermMonths || 0,
        selfConsumptionPct: selfConsumptionPct || 80,
        annualDegradationPct: annualDegradationPct || 0.6,
        annualRateEscalationPct: annualRateEscalationPct || 4,
        cashFlowProjection: cashFlowProjection ? JSON.stringify(cashFlowProjection) : '[]',
        headlineMetrics: headlineMetrics ? JSON.stringify(headlineMetrics) : '{}',
        status: status || 'draft',
      },
    });

    return NextResponse.json({ data: roi }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/energy/roi]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
