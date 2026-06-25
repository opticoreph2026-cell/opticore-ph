/**
 * @file src/lib/roi-engine.ts
 * @description ROI / Financial Computation Engine — OptiCore Energy Solutions
 *
 * Implements Part G formulas from the platform specification.
 * All functions are PURE (no DB calls). Money is always Int centavos (₱ × 100).
 *
 * CRITICAL RULE (Part G.1):
 *   Self-consumed kWh → saved at RETAIL (all-in) rate.
 *   Exported kWh      → credited at BGC (blended generation charge) only.
 *   Zero-Export / Off-Grid → export credit is ALWAYS ₱0.
 *   NEVER use a single "savings rate" for both. This is the #1 market error.
 *
 * Rate input format: Int rate units (₱/kWh × 10,000)
 *   e.g., ₱12.88/kWh → 128800 rate units
 *   Conversion: centavosPerKwh = rateUnits × kWh / 10_000 * 100
 *             → simplification: savings_centavos = rateUnits × kWh / 100
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type DesignPathway = 'grid_tied_net_metered' | 'zero_export_hybrid' | 'off_grid';

export interface EnergyFlowResult {
  annualPvGenerationKwh: number;
  selfConsumedKwh: number;
  exportedKwh: number;    // 0 for zero_export / off_grid
  gridImportedKwh: number;
  selfConsumptionMatchFactor: number;
}

export interface Year1FinancialResult {
  /** Centavos */
  billWithoutSystemCentavos: number;
  billWithSystemCentavos: number;
  grossSavingsCentavos: number;
  netSavingsCentavos: number;
  /** Rate trace for audit/credibility */
  rateTrace: {
    utilityName: string;
    customerClass: string;
    effectiveDate: string;
    allInRateRu: number;
    bgcRateRu: number;
  };
}

export interface CashFlowYear {
  year: number;
  pvYieldKwh: number;
  annualLoadKwh: number;
  selfConsumedKwh: number;
  exportedKwh: number;
  gridImportedKwh: number;
  grossSavingsCentavos: number;
  omCostCentavos: number;
  loanPaymentCentavos: number;
  netCashFlowCentavos: number;       // savings - OM - loan payment (capex at year 0)
  cumulativeCashFlowCentavos: number;
  retailRateRu: number;
  bgcRateRu: number;
}

export interface HeadlineMetrics {
  simplePaybackYears: number;
  discountedPaybackYears: number | null;
  npvCentavos: number;
  irrPct: number | null;
  lcoeCentavosPerKwh: number;
  yearOneSavingsCentavos: number;
  netBenefit25yrCentavos: number;
  isCashFlowPositive: boolean;     // monthly savings > monthly loan payment
  monthlyLoanPaymentCentavos: number;
  monthlySavingsYear1Centavos: number;
}

export interface MultiYearConfig {
  pathway: DesignPathway;
  capexTotalCentavos: number;
  year1AllInRateRu: number;
  year1BgcRateRu: number;
  year1AnnualLoadKwh: number;
  year1PvYieldKwh: number;
  selfConsumptionPct: number;      // e.g., 70 for 70%
  annualDegradationPct: number;    // e.g., 0.6
  annualRateEscalationPct: number; // e.g., 4
  annualLoadGrowthPct: number;     // e.g., 0 (default)
  omAnnualCostCentavos: number;
  analysisHorizonYears: number;
  discountRatePct: number;
  financingType: 'cash' | 'loan';
  loanPrincipalCentavos?: number;
  loanAnnualInterestRatePct?: number;
  loanTermMonths?: number;
  utilityName: string;
  customerClass: string;
  effectiveDate: string;
}

// ─── G.2 Annual Energy Flow Model ────────────────────────────────────────────

/**
 * Compute how PV generation is split between self-consumption and export.
 *
 * Self-consumption match factor defaults vary by use case:
 *   - Residential without battery: 0.30–0.50
 *   - Residential with battery: 0.65–0.85  (battery time-shifts evening load)
 *   - Daytime-heavy commercial without battery: 0.60–0.80
 *   - Daytime-heavy commercial with battery: 0.75–0.90
 *
 * The selfConsumptionPct parameter is user-controlled in the ROI UI
 * (the slide from 10%–100% in the consultation view).
 */
export function computeAnnualEnergyFlow(params: {
  annualPvGenerationKwh: number;
  annualLoadKwh: number;
  selfConsumptionPct: number; // 0–100, what % of PV output is consumed on-site
  pathway: DesignPathway;
}): EnergyFlowResult {
  const { annualPvGenerationKwh, annualLoadKwh, selfConsumptionPct, pathway } = params;

  // Self-consumed cannot exceed annual load (you can't consume more than you use)
  const selfConsumedKwh = Math.min(
    annualPvGenerationKwh * (selfConsumptionPct / 100),
    annualLoadKwh,
  );

  // Export = generation minus self-consumed; always 0 for non-net-metered pathways
  const rawExport = annualPvGenerationKwh - selfConsumedKwh;
  const exportedKwh = pathway === 'grid_tied_net_metered' ? rawExport : 0;

  const gridImportedKwh = Math.max(annualLoadKwh - selfConsumedKwh, 0);

  return {
    annualPvGenerationKwh,
    selfConsumedKwh,
    exportedKwh,
    gridImportedKwh,
    selfConsumptionMatchFactor: selfConsumptionPct / 100,
  };
}

// ─── G.3 Year-1 Financial Result ─────────────────────────────────────────────

/**
 * CRITICAL: retailRateRu and bgcRateRu are ALWAYS treated as distinct.
 * For zero_export / off_grid: bgcRateRu is irrelevant (export = 0).
 *
 * Centavos formula:
 *   savings_centavos = rateRu × kWh / 100
 *   (because rateRu = ₱/kWh × 10,000 and centavos = ₱ × 100)
 */
export function computeYear1Financials(params: {
  energyFlow: EnergyFlowResult;
  allInRateRu: number;           // retail rate in rate units
  bgcRateRu: number;             // BGC (export credit) rate in rate units
  omAnnualCostCentavos: number;
  rateTrace: Year1FinancialResult['rateTrace'];
}): Year1FinancialResult {
  const { energyFlow, allInRateRu, bgcRateRu, omAnnualCostCentavos, rateTrace } = params;

  const totalAnnualLoadKwh = energyFlow.selfConsumedKwh + energyFlow.gridImportedKwh;
  const billWithoutCentavos = Math.round(totalAnnualLoadKwh * allInRateRu / 100);

  // Bill WITH system:
  //   Pay for grid imports at retail rate
  //   Receive export credit at BGC (for net-metered only)
  const gridImportCostCentavos = Math.round(energyFlow.gridImportedKwh * allInRateRu / 100);
  const exportCreditCentavos = Math.round(energyFlow.exportedKwh * bgcRateRu / 100);
  const billWithSystemCentavos = Math.max(gridImportCostCentavos - exportCreditCentavos, 0);

  const grossSavingsCentavos = billWithoutCentavos - billWithSystemCentavos;
  const netSavingsCentavos = grossSavingsCentavos - omAnnualCostCentavos;

  return {
    billWithoutSystemCentavos: billWithoutCentavos,
    billWithSystemCentavos,
    grossSavingsCentavos,
    netSavingsCentavos,
    rateTrace,
  };
}

// ─── G.4 Multi-Year Cash Flow Projection ─────────────────────────────────────

/**
 * Project full cash flow over the analysis horizon (typically 25 years).
 * Year 0 = CapEx outflow. Year 1–N = annual net savings.
 */
export function projectMultiYear(config: MultiYearConfig): CashFlowYear[] {
  const monthlyLoanPayment = config.financingType === 'loan' && config.loanPrincipalCentavos
    ? computeMonthlyLoanPayment(
        config.loanPrincipalCentavos,
        config.loanAnnualInterestRatePct ?? 10,
        config.loanTermMonths ?? 60,
      )
    : 0;

  const annualLoanPayment = monthlyLoanPayment * 12;
  const rows: CashFlowYear[] = [];
  let cumulativeCashFlow = -config.capexTotalCentavos;

  for (let t = 0; t <= config.analysisHorizonYears; t++) {
    if (t === 0) {
      rows.push({
        year: 0,
        pvYieldKwh: 0,
        annualLoadKwh: config.year1AnnualLoadKwh,
        selfConsumedKwh: 0,
        exportedKwh: 0,
        gridImportedKwh: config.year1AnnualLoadKwh,
        grossSavingsCentavos: 0,
        omCostCentavos: 0,
        loanPaymentCentavos: 0,
        netCashFlowCentavos: -config.capexTotalCentavos,
        cumulativeCashFlowCentavos: -config.capexTotalCentavos,
        retailRateRu: config.year1AllInRateRu,
        bgcRateRu: config.year1BgcRateRu,
      });
      continue;
    }

    // Time-adjusted values
    const scaledLoad = config.year1AnnualLoadKwh * Math.pow(1 + config.annualLoadGrowthPct / 100, t - 1);
    const retailRateRu = Math.round(config.year1AllInRateRu * Math.pow(1 + config.annualRateEscalationPct / 100, t - 1));
    const bgcRateRu = Math.round(config.year1BgcRateRu * Math.pow(1 + config.annualRateEscalationPct / 100, t - 1));
    const pvYieldKwh = config.year1PvYieldKwh * Math.pow(1 - config.annualDegradationPct / 100, t - 1);

    const energyFlow = computeAnnualEnergyFlow({
      annualPvGenerationKwh: pvYieldKwh,
      annualLoadKwh: scaledLoad,
      selfConsumptionPct: config.selfConsumptionPct,
      pathway: config.pathway,
    });

    const gridImportCost = Math.round(energyFlow.gridImportedKwh * retailRateRu / 100);
    const exportCredit = Math.round(energyFlow.exportedKwh * bgcRateRu / 100);
    const billWith = Math.max(gridImportCost - exportCredit, 0);
    const billWithout = Math.round(scaledLoad * retailRateRu / 100);
    const grossSavings = billWithout - billWith;

    const omCost = Math.round(config.omAnnualCostCentavos * Math.pow(1.02, t - 1)); // 2% OM escalation
    const loanPayment = t <= (config.loanTermMonths ? Math.ceil(config.loanTermMonths / 12) : 0)
      ? annualLoanPayment
      : 0;

    const netCashFlow = grossSavings - omCost - loanPayment;
    cumulativeCashFlow += netCashFlow;

    rows.push({
      year: t,
      pvYieldKwh: Math.round(pvYieldKwh * 10) / 10,
      annualLoadKwh: Math.round(scaledLoad * 10) / 10,
      selfConsumedKwh: Math.round(energyFlow.selfConsumedKwh * 10) / 10,
      exportedKwh: Math.round(energyFlow.exportedKwh * 10) / 10,
      gridImportedKwh: Math.round(energyFlow.gridImportedKwh * 10) / 10,
      grossSavingsCentavos: grossSavings,
      omCostCentavos: omCost,
      loanPaymentCentavos: loanPayment,
      netCashFlowCentavos: netCashFlow,
      cumulativeCashFlowCentavos: cumulativeCashFlow,
      retailRateRu,
      bgcRateRu,
    });
  }

  return rows;
}

// ─── G.5 Headline Metrics ────────────────────────────────────────────────────

/**
 * Compute the 6 headline metrics always shown together (never payback alone).
 */
export function computeHeadlineMetrics(
  cashFlows: CashFlowYear[],
  config: Pick<
    MultiYearConfig,
    | 'capexTotalCentavos'
    | 'discountRatePct'
    | 'financingType'
    | 'loanPrincipalCentavos'
    | 'loanAnnualInterestRatePct'
    | 'loanTermMonths'
  >,
): HeadlineMetrics {
  const discountRate = config.discountRatePct / 100;
  const year1 = cashFlows.find((c) => c.year === 1);
  const yearOneSavingsCentavos = year1?.netCashFlowCentavos ?? 0;

  // Simple payback = CapEx / Year-1 net savings
  const simplePaybackYears =
    yearOneSavingsCentavos > 0 ? config.capexTotalCentavos / yearOneSavingsCentavos : Infinity;

  // Discounted payback = first year where cumulative discounted CF ≥ 0
  let cumulativeDiscounted = -config.capexTotalCentavos;
  let discountedPaybackYears: number | null = null;
  let npv = -config.capexTotalCentavos;

  const productionRows = cashFlows.filter((c) => c.year > 0);

  // Total discounted PV output for LCOE
  let totalDiscountedYield = 0;
  let totalDiscountedCost = config.capexTotalCentavos;

  for (const row of productionRows) {
    const discountFactor = Math.pow(1 + discountRate, row.year);
    const discountedCF = row.netCashFlowCentavos / discountFactor;
    cumulativeDiscounted += discountedCF;
    npv += discountedCF;
    totalDiscountedYield += row.pvYieldKwh / discountFactor;
    totalDiscountedCost += row.omCostCentavos / discountFactor;

    if (discountedPaybackYears === null && cumulativeDiscounted >= 0) {
      discountedPaybackYears = row.year;
    }
  }

  // IRR via bisection (solve NPV = 0)
  const irrPct = solveIRR(cashFlows);

  // LCOE = (CapEx + PV of OM costs) / PV of lifetime yield
  // In centavos per kWh: totalDiscountedCost [centavos] / totalDiscountedYield [kWh]
  const lcoeCentavosPerKwh = totalDiscountedYield > 0
    ? Math.round(totalDiscountedCost / totalDiscountedYield)
    : 0;

  // 25-year net benefit (year 0 already includes -capexTotalCentavos)
  const netBenefit25yrCentavos =
    cashFlows.filter((c) => c.year >= 0 && c.year <= 25).reduce(
      (sum, c) => sum + c.netCashFlowCentavos,
      0,
    );

  // Cash-flow-positive for loan scenarios
  const monthlyLoanPaymentCentavos =
    config.financingType === 'loan' && config.loanPrincipalCentavos
      ? computeMonthlyLoanPayment(
          config.loanPrincipalCentavos,
          config.loanAnnualInterestRatePct ?? 10,
          config.loanTermMonths ?? 60,
        )
      : 0;

  const monthlySavingsYear1Centavos = Math.round(yearOneSavingsCentavos / 12);
  const isCashFlowPositive =
    config.financingType === 'loan'
      ? monthlySavingsYear1Centavos > monthlyLoanPaymentCentavos
      : true;

  return {
    simplePaybackYears: Math.round(simplePaybackYears * 10) / 10,
    discountedPaybackYears,
    npvCentavos: Math.round(npv),
    irrPct: irrPct !== null ? Math.round(irrPct * 10) / 10 : null,
    lcoeCentavosPerKwh,
    yearOneSavingsCentavos,
    netBenefit25yrCentavos: Math.round(netBenefit25yrCentavos),
    isCashFlowPositive,
    monthlyLoanPaymentCentavos: Math.round(monthlyLoanPaymentCentavos),
    monthlySavingsYear1Centavos,
  };
}

// ─── G.6 Loan Amortization ───────────────────────────────────────────────────

/**
 * Standard amortization formula.
 * Returns monthly payment in centavos.
 */
export function computeMonthlyLoanPayment(
  principalCentavos: number,
  annualInterestRatePct: number,
  termMonths: number,
): number {
  if (annualInterestRatePct === 0) return Math.round(principalCentavos / termMonths);
  const monthlyRate = annualInterestRatePct / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, termMonths);
  return Math.round((principalCentavos * monthlyRate * factor) / (factor - 1));
}

// ─── IRR Solver (bisection) ───────────────────────────────────────────────────

function solveIRR(cashFlows: CashFlowYear[]): number | null {
  const flows = cashFlows.map((c) => c.netCashFlowCentavos);
  if (flows[0] === undefined || flows[0] >= 0) return null; // CapEx must be negative at t=0

  function npvAtRate(r: number): number {
    return flows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + r, t), 0);
  }

  let lo = -0.5;
  let hi = 5.0;
  const tolerance = 0.0001;
  const maxIter = 200;

  if (npvAtRate(lo) * npvAtRate(hi) > 0) return null;

  for (let i = 0; i < maxIter; i++) {
    const mid = (lo + hi) / 2;
    if (Math.abs(hi - lo) < tolerance) return mid * 100;
    if (npvAtRate(mid) * npvAtRate(lo) < 0) hi = mid;
    else lo = mid;
  }
  return ((lo + hi) / 2) * 100;
}

// ─── Rate Unit Helpers ────────────────────────────────────────────────────────

/** Convert rate units (₱/kWh × 10,000) to ₱/kWh display string */
export function rateUnitToPhpDisplay(rateRu: number): string {
  return (rateRu / 10000).toFixed(4);
}

/** Convert ₱/kWh float to rate units */
export function phpPerKwhToRateUnit(phpPerKwh: number): number {
  return Math.round(phpPerKwh * 10000);
}

/** Convert centavos to ₱ display string */
export function centavosToPhpDisplay(centavos: number): string {
  return (centavos / 100).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Convert centavos to ₱ with symbol */
export function formatPhp(centavos: number): string {
  return `₱${centavosToPhpDisplay(centavos)}`;
}
