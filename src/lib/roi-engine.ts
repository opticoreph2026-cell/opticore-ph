/**
 * @file src/lib/roi-engine.ts
 * @description ROI / Financial Computation Engine — OptiCore Energy Solutions
 *
 * Implements Part G formulas from the platform specification.
 * Money is stored as Decimal(10,2) pesos. Rate units stay Int (₱/kWh × 10,000).
 *
 * CRITICAL RULE (Part G.1):
 *   Self-consumed kWh → saved at RETAIL (all-in) rate.
 *   Exported kWh      → credited at BGC (blended generation charge) only.
 *   Zero-Export / Off-Grid → export credit is ALWAYS ₱0.
 *   NEVER use a single "savings rate" for both. This is the #1 market error.
 *
 * Rate input format: Int rate units (₱/kWh × 10,000)
 *   e.g., ₱12.88/kWh → 128800 rate units
 *   Conversion: savings_pesos = rateUnits × kWh / 10_000
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
  billWithoutSystem: number;
  billWithSystem: number;
  grossSavings: number;
  netSavings: number;
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
  grossSavings: number;
  omCost: number;
  loanPayment: number;
  netCashFlow: number;       // savings - OM - loan payment (capex at year 0)
  cumulativeCashFlow: number;
  retailRateRu: number;
  bgcRateRu: number;
}

export interface HeadlineMetrics {
  simplePaybackYears: number;
  discountedPaybackYears: number | null;
  npv: number;
  irrPct: number | null;
  lcoePesosPerKwh: number;
  yearOneSavings: number;
  netBenefit25yr: number;
  isCashFlowPositive: boolean;     // monthly savings > monthly loan payment
  monthlyLoanPayment: number;
  monthlySavingsYear1: number;
}

export interface MultiYearConfig {
  pathway: DesignPathway;
  capexTotal: number;
  year1AllInRateRu: number;
  year1BgcRateRu: number;
  year1AnnualLoadKwh: number;
  year1PvYieldKwh: number;
  selfConsumptionPct: number;      // e.g., 70 for 70%
  annualDegradationPct: number;    // e.g., 0.6
  annualRateEscalationPct: number; // e.g., 4
  annualLoadGrowthPct: number;     // e.g., 0 (default)
  omAnnualCost: number;
  analysisHorizonYears: number;
  discountRatePct: number;
  financingType: 'cash' | 'loan';
  loanPrincipal?: number;
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
 * Formula: savings_pesos = rateRu × kWh / 10_000
 *   (rateRu = ₱/kWh × 10,000, so rateRu × kWh / 10_000 = ₱)
 */
export function computeYear1Financials(params: {
  energyFlow: EnergyFlowResult;
  allInRateRu: number;           // retail rate in rate units
  bgcRateRu: number;             // BGC (export credit) rate in rate units
  omAnnualCost: number;
  rateTrace: Year1FinancialResult['rateTrace'];
}): Year1FinancialResult {
  const { energyFlow, allInRateRu, bgcRateRu, omAnnualCost, rateTrace } = params;

  const totalAnnualLoadKwh = energyFlow.selfConsumedKwh + energyFlow.gridImportedKwh;
  const billWithout = Math.round(totalAnnualLoadKwh * allInRateRu / 10000);

  // Bill WITH system:
  //   Pay for grid imports at retail rate
  //   Receive export credit at BGC (for net-metered only)
  const gridImportCost = Math.round(energyFlow.gridImportedKwh * allInRateRu / 10000);
  const exportCredit = Math.round(energyFlow.exportedKwh * bgcRateRu / 10000);
  const billWithSystem = Math.max(gridImportCost - exportCredit, 0);

  const grossSavings = billWithout - billWithSystem;
  const netSavings = grossSavings - omAnnualCost;

  return {
    billWithoutSystem: billWithout,
    billWithSystem,
    grossSavings,
    netSavings,
    rateTrace,
  };
}

// ─── G.4 Multi-Year Cash Flow Projection ─────────────────────────────────────

/**
 * Project full cash flow over the analysis horizon (typically 25 years).
 * Year 0 = CapEx outflow. Year 1–N = annual net savings.
 */
export function projectMultiYear(config: MultiYearConfig): CashFlowYear[] {
  const monthlyLoanPayment = config.financingType === 'loan' && config.loanPrincipal
    ? computeMonthlyLoanPayment(
        config.loanPrincipal,
        config.loanAnnualInterestRatePct ?? 10,
        config.loanTermMonths ?? 60,
      )
    : 0;

  const annualLoanPayment = monthlyLoanPayment * 12;
  const rows: CashFlowYear[] = [];
  let cumulativeCashFlow = -config.capexTotal;

  for (let t = 0; t <= config.analysisHorizonYears; t++) {
    if (t === 0) {
      rows.push({
        year: 0,
        pvYieldKwh: 0,
        annualLoadKwh: config.year1AnnualLoadKwh,
        selfConsumedKwh: 0,
        exportedKwh: 0,
        gridImportedKwh: config.year1AnnualLoadKwh,
        grossSavings: 0,
        omCost: 0,
        loanPayment: 0,
        netCashFlow: -config.capexTotal,
        cumulativeCashFlow: -config.capexTotal,
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

    const gridImportCost = Math.round(energyFlow.gridImportedKwh * retailRateRu / 10000);
    const exportCredit = Math.round(energyFlow.exportedKwh * bgcRateRu / 10000);
    const billWith = Math.max(gridImportCost - exportCredit, 0);
    const billWithout = Math.round(scaledLoad * retailRateRu / 10000);
    const grossSavings = billWithout - billWith;

    const omCost = Math.round(config.omAnnualCost * Math.pow(1.02, t - 1)); // 2% OM escalation
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
      grossSavings,
      omCost,
      loanPayment,
      netCashFlow,
      cumulativeCashFlow,
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
    | 'capexTotal'
    | 'discountRatePct'
    | 'financingType'
    | 'loanPrincipal'
    | 'loanAnnualInterestRatePct'
    | 'loanTermMonths'
  >,
): HeadlineMetrics {
  const discountRate = config.discountRatePct / 100;
  const year1 = cashFlows.find((c) => c.year === 1);
  const yearOneSavings = year1?.netCashFlow ?? 0;

  // Simple payback = CapEx / Year-1 net savings
  const simplePaybackYears =
    yearOneSavings > 0 ? config.capexTotal / yearOneSavings : Infinity;

  // Discounted payback = first year where cumulative discounted CF ≥ 0
  let cumulativeDiscounted = -config.capexTotal;
  let discountedPaybackYears: number | null = null;
  let npv = -config.capexTotal;

  const productionRows = cashFlows.filter((c) => c.year > 0);

  // Total discounted PV output for LCOE
  let totalDiscountedYield = 0;
  let totalDiscountedCost = config.capexTotal;

  for (const row of productionRows) {
    const discountFactor = Math.pow(1 + discountRate, row.year);
    const discountedCF = row.netCashFlow / discountFactor;
    cumulativeDiscounted += discountedCF;
    npv += discountedCF;
    totalDiscountedYield += row.pvYieldKwh / discountFactor;
    totalDiscountedCost += row.omCost / discountFactor;

    if (discountedPaybackYears === null && cumulativeDiscounted >= 0) {
      discountedPaybackYears = row.year;
    }
  }

  // IRR via bisection (solve NPV = 0)
  const irrPct = solveIRR(cashFlows);

  // LCOE = (CapEx + PV of OM costs) / PV of lifetime yield
  const lcoePesosPerKwh = totalDiscountedYield > 0
    ? Math.round(totalDiscountedCost / totalDiscountedYield * 100) / 100
    : 0;

  // 25-year net benefit (year 0 already includes -capexTotal)
  const netBenefit25yr =
    cashFlows.filter((c) => c.year >= 0 && c.year <= 25).reduce(
      (sum, c) => sum + c.netCashFlow,
      0,
    );

  // Cash-flow-positive for loan scenarios
  const monthlyLoanPayment =
    config.financingType === 'loan' && config.loanPrincipal
      ? computeMonthlyLoanPayment(
          config.loanPrincipal,
          config.loanAnnualInterestRatePct ?? 10,
          config.loanTermMonths ?? 60,
        )
      : 0;

  const monthlySavingsYear1 = Math.round(yearOneSavings / 12);
  const isCashFlowPositive =
    config.financingType === 'loan'
      ? monthlySavingsYear1 > monthlyLoanPayment
      : true;

  return {
    simplePaybackYears: Math.round(simplePaybackYears * 10) / 10,
    discountedPaybackYears,
    npv: Math.round(npv),
    irrPct: irrPct !== null ? Math.round(irrPct * 10) / 10 : null,
    lcoePesosPerKwh,
    yearOneSavings,
    netBenefit25yr: Math.round(netBenefit25yr),
    isCashFlowPositive,
    monthlyLoanPayment: Math.round(monthlyLoanPayment),
    monthlySavingsYear1,
  };
}

// ─── G.6 Loan Amortization ───────────────────────────────────────────────────

/**
 * Standard amortization formula.
 * Returns monthly payment in pesos.
 */
export function computeMonthlyLoanPayment(
  principal: number,
  annualInterestRatePct: number,
  termMonths: number,
): number {
  if (annualInterestRatePct === 0) return Math.round(principal / termMonths);
  const monthlyRate = annualInterestRatePct / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, termMonths);
  return Math.round((principal * monthlyRate * factor) / (factor - 1));
}

// ─── IRR Solver (bisection) ───────────────────────────────────────────────────

function solveIRR(cashFlows: CashFlowYear[]): number | null {
  const flows = cashFlows.map((c) => c.netCashFlow);
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

/** Convert pesos to ₱ display string */
export function pesosToPhpDisplay(pesos: number): string {
  return pesos.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Convert pesos to ₱ with symbol */
export function formatPhp(pesos: number): string {
  return `₱${pesosToPhpDisplay(pesos)}`;
}
