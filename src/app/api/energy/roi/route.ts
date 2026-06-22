import 'server-only';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessCrm } from '@/lib/energy-auth';
import {
  computeAnnualEnergyFlow,
  computeHeadlineMetrics,
  projectMultiYear,
  type DesignPathway,
  type MultiYearConfig,
} from '@/lib/roi-engine';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !canAccessCrm(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const designId = searchParams.get('designId');

    if (!designId) {
      return NextResponse.json({ error: 'designId query param required' }, { status: 400 });
    }

    const scenarios = await db.roiScenario.findMany({
      where: { designId },
      orderBy: { createdAt: 'desc' },
      include: {
        design: {
          include: {
            site: { include: { customer: true } },
            inverter: true,
            battery: true,
          },
        },
      },
    });

    return NextResponse.json({ data: scenarios });
  } catch (err) {
    console.error('[GET /api/energy/roi]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !canAccessCrm(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      designId,
      selfConsumptionPct = 70,
      capexTotalCentavos,
      omAnnualCostCentavos = 500000,
      financingType = 'cash',
      loanPrincipalCentavos = 0,
      loanInterestRatePct = 10,
      loanTermMonths = 60,
      annualDegradationPct = 0.6,
      annualRateEscalationPct = 5,
      discountRatePct = 8,
      allInRateRu = 105000,
      bgcRateRu = 65000,
      utilityName = 'VECO',
      customerClass = 'residential',
    } = body;

    if (!designId) {
      return NextResponse.json({ error: 'designId is required' }, { status: 400 });
    }

    const design = await db.systemDesign.findUnique({
      where: { id: designId },
      include: {
        assessment: true,
        bomItems: true,
      },
    });

    if (!design) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    const pathway = design.designPathway as DesignPathway;
    const annualLoadKwh = design.assessment?.averageMonthlyKwh
      ? design.assessment.averageMonthlyKwh * 12
      : design.estimatedAnnualYieldKwh;

    const capex =
      capexTotalCentavos ??
      design.bomItems.reduce(
        (s: number, i: { unitCostCentavos: number; quantity: number }) =>
          s + i.unitCostCentavos * i.quantity,
        0,
      ) + 4000000;

    const energyFlow = computeAnnualEnergyFlow({
      annualPvGenerationKwh: design.estimatedAnnualYieldKwh,
      annualLoadKwh,
      selfConsumptionPct,
      pathway,
    });

    const config: MultiYearConfig = {
      pathway,
      capexTotalCentavos: capex,
      year1AllInRateRu: allInRateRu,
      year1BgcRateRu: bgcRateRu,
      year1AnnualLoadKwh: annualLoadKwh,
      year1PvYieldKwh: design.estimatedAnnualYieldKwh,
      selfConsumptionPct,
      annualDegradationPct,
      annualRateEscalationPct,
      annualLoadGrowthPct: 0,
      omAnnualCostCentavos,
      analysisHorizonYears: 25,
      discountRatePct,
      financingType,
      loanPrincipalCentavos: financingType === 'loan' ? loanPrincipalCentavos : 0,
      loanAnnualInterestRatePct: loanInterestRatePct,
      loanTermMonths,
      utilityName,
      customerClass,
      effectiveDate: new Date().toISOString().slice(0, 10),
    };

    const cashFlow = projectMultiYear(config);
    const headline = computeHeadlineMetrics(cashFlow, config);

    const resultsJson = {
      energyFlow,
      headline,
      cashFlowByYear: cashFlow,
      year1SavingsCentavos: headline.yearOneSavingsCentavos,
      simplePaybackYears: headline.simplePaybackYears,
      npvCentavos: headline.npvCentavos,
      irrPct: headline.irrPct,
      lcoeCentavosPerKwh: headline.lcoeCentavosPerKwh,
      netBenefit25yrCentavos: headline.netBenefit25yrCentavos,
    };

    const scenario = await db.roiScenario.create({
      data: {
        designId,
        scenarioLabel: 'Base Scenario',
        pathway,
        selfConsumptionPct,
        exportPct: pathway === 'grid_tied_net_metered' ? 100 - selfConsumptionPct : 0,
        capexTotalCentavos: capex,
        financingType,
        loanTermMonths: financingType === 'loan' ? loanTermMonths : null,
        loanInterestRatePct: financingType === 'loan' ? loanInterestRatePct : null,
        annualDegradationPct,
        annualRateEscalationPct,
        discountRatePct,
        omAnnualCostCentavos,
        analysisHorizonYears: 25,
        resultsJson: JSON.stringify(resultsJson),
        generatedById: session.sub,
      },
    });

    return NextResponse.json({ data: { ...scenario, parsedResults: resultsJson } }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/energy/roi]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
