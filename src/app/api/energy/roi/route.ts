import 'server-only';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessDesigns } from '@/lib/energy-auth';
import {
  computeAnnualEnergyFlow,
  computeHeadlineMetrics,
  projectMultiYear,
  type DesignPathway,
  type MultiYearConfig,
} from '@/lib/roi-engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !canAccessDesigns(session as any)) {
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
      select: {
        id: true, designId: true, scenarioLabel: true, pathway: true,
        selfConsumptionPct: true, exportPct: true, capexTotal: true,
        capexBreakdownJson: true, financingType: true,
        loanTermMonths: true, loanInterestRatePct: true,
        annualDegradationPct: true, annualRateEscalationPct: true,
        discountRatePct: true, omAnnualCost: true, analysisHorizonYears: true,
        resultsJson: true, generatedById: true, createdAt: true, updatedAt: true,
        design: {
          select: {
            pvArrayKwp: true, estimatedAnnualYieldKwh: true, designPathway: true,
            site: { select: { customer: { select: { fullName: true } } } },
            inverter: { select: { modelName: true, manufacturer: true } },
            battery: { select: { modelName: true, manufacturer: true } },
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
    if (!session || !canAccessDesigns(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      designId,
      selfConsumptionPct = 70,
      capexTotal,
      omAnnualCost = 5000,
      financingType = 'cash',
      loanPrincipal = 0,
      loanInterestRatePct = 10,
      loanTermMonths = 60,
      annualDegradationPct = 0.6,
      annualRateEscalationPct = 5,
      discountRatePct = 8,
      allInRateRu = 105000,
      blendedGenerationRateRu = 65000,
      utilityName = 'VECO',
      customerClass = 'residential',
      utilityCompanyId,
    } = body;

    // DB rate lookup fallback
    let resolvedAllInRateRu = allInRateRu;
    let resolvedBgcRateRu = blendedGenerationRateRu;
    let resolvedUtilityName = utilityName;

    if (utilityCompanyId) {
      try {
        const latestRate = await db.utilityRateSchedule.findFirst({
          where: { utilityCompanyId },
          orderBy: { effectiveDate: 'desc' },
          select: { allInRateRu: true, blendedGenerationRateRu: true },
        });
        if (latestRate) {
          resolvedAllInRateRu = latestRate.allInRateRu;
          resolvedBgcRateRu = latestRate.blendedGenerationRateRu ?? Math.round(latestRate.allInRateRu * 0.65);
        }
        const company = await db.energyUtilityCompany.findUnique({
          where: { id: utilityCompanyId },
          select: { name: true, code: true },
        });
        if (company) {
          resolvedUtilityName = company.name;
        }
      } catch {
        // Fall back to client-provided rates
      }
    }

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
      capexTotal ??
      design.bomItems.reduce(
        (s: number, i: { unitCost: number; quantity: number }) =>
          s + i.unitCost * i.quantity,
        0,
      ) + 40000;

    const energyFlow = computeAnnualEnergyFlow({
      annualPvGenerationKwh: design.estimatedAnnualYieldKwh,
      annualLoadKwh,
      selfConsumptionPct,
      pathway,
    });

    const config: MultiYearConfig = {
      pathway,
      capexTotal: capex,
      year1AllInRateRu: resolvedAllInRateRu,
      year1BgcRateRu: resolvedBgcRateRu,
      year1AnnualLoadKwh: annualLoadKwh,
      year1PvYieldKwh: design.estimatedAnnualYieldKwh,
      selfConsumptionPct,
      annualDegradationPct,
      annualRateEscalationPct,
      annualLoadGrowthPct: 0,
      omAnnualCost,
      analysisHorizonYears: 25,
      discountRatePct,
      financingType,
      loanPrincipal: financingType === 'loan' ? loanPrincipal : 0,
      loanAnnualInterestRatePct: loanInterestRatePct,
      loanTermMonths,
      utilityName: resolvedUtilityName,
      customerClass,
      effectiveDate: new Date().toISOString().slice(0, 10),
    };

    const cashFlow = projectMultiYear(config);
    const headline = computeHeadlineMetrics(cashFlow, config);

    const resultsJson = {
      energyFlow,
      headline,
      cashFlowByYear: cashFlow,
      year1Savings: headline.yearOneSavings,
      simplePaybackYears: headline.simplePaybackYears,
      npv: headline.npv,
      irrPct: headline.irrPct,
      lcoePesosPerKwh: headline.lcoePesosPerKwh,
      netBenefit25yr: headline.netBenefit25yr,
    };

    const scenario = await db.roiScenario.create({
      data: {
        designId,
        scenarioLabel: 'Base Scenario',
        pathway,
        selfConsumptionPct,
        exportPct: pathway === 'grid_tied_net_metered' ? 100 - selfConsumptionPct : 0,
        capexTotal: capex,
        financingType,
        loanTermMonths: financingType === 'loan' ? loanTermMonths : null,
        loanInterestRatePct: financingType === 'loan' ? loanInterestRatePct : null,
        annualDegradationPct,
        annualRateEscalationPct,
        discountRatePct,
        omAnnualCost,
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
