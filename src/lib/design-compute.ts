/**
 * @file src/lib/design-compute.ts
 * @description Orchestrates solar-design.ts engine with catalog data.
 * Pure functions — no DB calls.
 */

import {
  type BatterySpec,
  type CriticalLoad,
  type DesignPathway,
  type GridConnectionType,
  type InverterSpec,
  computeAnnualPvYield,
  computeCableSizing,
  computeCriticalBackupRequirements,
  computePvArraySize,
  generateSldData,
  selectNeovoltConfiguration,
} from '@/lib/solar-design';

export interface DesignComputeInput {
  averageMonthlyKwh: number;
  averageMonthlyBillCentavos: number;
  gridConnectionType: GridConnectionType;
  designPathway: DesignPathway;
  customerType: string;
  peakSunHours: number;
  targetOffsetPct: number;
  panelWattage: number;
  backupAutonomyHours: number;
  criticalLoads: CriticalLoad[];
  availableRoofAreaSqm?: number;
}

/** Placeholder distributor pricing when catalog `isPriceConfirmed` is false */
export const ESTIMATED_UNIT_PRICES_CENTAVOS: Record<string, number> = {
  'BW-INV-SPH3.6K': 8500000,
  'BW-INV-SPH5K': 10500000,
  'BW-INV-SPH6K': 12500000,
  'BW-INV-SPH8K': 15500000,
  'BW-INV-TPH4K': 12000000,
  'BW-INV-TPH6K': 14500000,
  'BW-INV-TPH8K': 17000000,
  'BW-INV-TPH10K': 21000000,
  'BW-INV-TPH12K': 25000000,
  'BW-BAT-4.8S': 6500000,
  'BW-BAT-9.6P': 11500000,
  'BW-BAT-10.1P': 12500000,
};

export const ESTIMATED_PANEL_PRICE_CENTAVOS = 750000; // ₱7,500 per 550W panel (editable)
export const ESTIMATED_INSTALLATION_PCT = 0.15;
export const ESTIMATED_DESIGN_FEE_CENTAVOS = 1500000; // ₱15,000
export const ESTIMATED_PERMIT_FEE_CENTAVOS = 2500000; // ₱25,000

export interface BomLineItem {
  itemType: string;
  description: string;
  quantity: number;
  unit: string;
  unitCostCentavos: number;
  totalCentavos: number;
  source: string;
}

export interface DesignComputeResult {
  pv: ReturnType<typeof computePvArraySize>;
  backup: ReturnType<typeof computeCriticalBackupRequirements>;
  selection: NonNullable<ReturnType<typeof selectNeovoltConfiguration>>;
  cabling: ReturnType<typeof computeCableSizing>;
  sld: ReturnType<typeof generateSldData>;
  annualYieldKwh: number;
  bom: BomLineItem[];
  hardwareSubtotalCentavos: number;
  installationFeeCentavos: number;
  designFeeCentavos: number;
  permitFeeCentavos: number;
  grandTotalCentavos: number;
  trace: Record<string, unknown>;
}

function resolveUnitPrice(spec: { sku: string; unitPriceCentavos: number }): number {
  if (spec.unitPriceCentavos > 0) return spec.unitPriceCentavos;
  return ESTIMATED_UNIT_PRICES_CENTAVOS[spec.sku] ?? 0;
}

/** Derive default critical loads from monthly consumption when survey is empty */
export function defaultCriticalLoadsFromBill(
  averageMonthlyKwh: number,
  backupAutonomyHours: number,
): CriticalLoad[] {
  const dailyKwh = averageMonthlyKwh / 30;
  const criticalDailyKwh = dailyKwh * 0.4;
  const avgWatts = Math.round((criticalDailyKwh / backupAutonomyHours) * 1000);
  return [
    {
      name: 'Essential loads (estimated)',
      watts: Math.max(avgWatts, 500),
      quantity: 1,
      hoursPerDay: backupAutonomyHours,
      mustBackup: true,
    },
  ];
}

export function runDesignCompute(
  input: DesignComputeInput,
  inverters: InverterSpec[],
  batteries: BatterySpec[],
): DesignComputeResult | { error: string } {
  const loads =
    input.criticalLoads.length > 0
      ? input.criticalLoads
      : defaultCriticalLoadsFromBill(input.averageMonthlyKwh, input.backupAutonomyHours);

  const backup = computeCriticalBackupRequirements(loads);

  const pv = computePvArraySize({
    averageMonthlyKwh: input.averageMonthlyKwh,
    targetOffsetPct: input.targetOffsetPct,
    peakSunHours: input.peakSunHours,
    systemDerateFactorPct: 78,
    panelWattage: input.panelWattage,
    availableRoofAreaSqm: input.availableRoofAreaSqm,
  });

  const requiredInverterKw = Math.max(
    backup.requiredInverterKw,
    pv.pvArrayKwp * 0.8,
  );

  const selection = selectNeovoltConfiguration({
    requiredPvKwp: pv.pvArrayKwp,
    requiredBatteryUsableKwh: backup.requiredBatteryUsableKwh,
    requiredInverterKw,
    gridConnectionType: input.gridConnectionType,
    customerType: input.customerType,
    inverters,
    batteries,
  });

  if (!selection) {
    return { error: 'No valid Neovolt configuration found for this load profile.' };
  }

  const cabling = computeCableSizing({
    ratedKw: selection.inverter.ratedAcKw * selection.inverterQuantity,
    voltageV: input.gridConnectionType === 'three_phase' ? 400 : 230,
  });

  const annualYieldKwh = computeAnnualPvYield({
    pvArrayKwp: pv.pvArrayKwp,
    peakSunHours: input.peakSunHours,
    systemDerateFactorPct: 78,
    annualDegradationPct: 0.6,
    year: 0,
  });

  const sld = generateSldData({
    pvKwp: pv.pvArrayKwp,
    panelCount: pv.panelCount,
    panelWattage: input.panelWattage,
    selection,
    cabling,
    pathway: input.designPathway,
  });

  const inverterUnit = resolveUnitPrice(selection.inverter);
  const batteryUnit = resolveUnitPrice(selection.battery);
  const panelUnit = ESTIMATED_PANEL_PRICE_CENTAVOS;

  const bom: BomLineItem[] = [
    {
      itemType: 'panel',
      description: `Solar PV Module ${input.panelWattage}W`,
      quantity: pv.panelCount,
      unit: 'pc',
      unitCostCentavos: panelUnit,
      totalCentavos: panelUnit * pv.panelCount,
      source: 'third_party',
    },
    {
      itemType: 'inverter',
      description: selection.inverter.modelName,
      quantity: selection.inverterQuantity,
      unit: 'pc',
      unitCostCentavos: inverterUnit,
      totalCentavos: inverterUnit * selection.inverterQuantity,
      source: 'neovolt_catalog',
    },
    {
      itemType: 'battery',
      description: selection.battery.modelName,
      quantity: selection.batteryQuantity,
      unit: 'pc',
      unitCostCentavos: batteryUnit,
      totalCentavos: batteryUnit * selection.batteryQuantity,
      source: 'neovolt_catalog',
    },
    {
      itemType: 'mounting',
      description: 'Mounting, BOS, cabling & breakers',
      quantity: 1,
      unit: 'lot',
      unitCostCentavos: Math.round(pv.pvArrayKwp * 350000),
      totalCentavos: Math.round(pv.pvArrayKwp * 350000),
      source: 'third_party',
    },
  ];

  const hardwareSubtotalCentavos = bom.reduce((s, i) => s + i.totalCentavos, 0);
  const installationFeeCentavos = Math.round(hardwareSubtotalCentavos * ESTIMATED_INSTALLATION_PCT);
  const designFeeCentavos = ESTIMATED_DESIGN_FEE_CENTAVOS;
  const permitFeeCentavos = ESTIMATED_PERMIT_FEE_CENTAVOS;
  const grandTotalCentavos =
    hardwareSubtotalCentavos + installationFeeCentavos + designFeeCentavos + permitFeeCentavos;

  return {
    pv,
    backup,
    selection,
    cabling,
    sld,
    annualYieldKwh,
    bom,
    hardwareSubtotalCentavos,
    installationFeeCentavos,
    designFeeCentavos,
    permitFeeCentavos,
    grandTotalCentavos,
    trace: {
      input,
      backup,
      pv: pv.trace,
      warnings: selection.warningFlags,
    },
  };
}

export function mapInverterFromDb(row: {
  id: string;
  sku: string;
  modelName: string;
  family: string;
  phase: number;
  ratedAcKw: number;
  maxPvInputKw: number;
  backupSurgeKw: number | null;
  maxParallelUnits: number;
  peakEfficiencyPct: number;
  unitPriceCentavos: number;
  isPriceConfirmed: boolean;
}): InverterSpec {
  return {
    id: row.id,
    sku: row.sku,
    modelName: row.modelName,
    family: row.family as InverterSpec['family'],
    phase: row.phase as 1 | 3,
    ratedAcKw: row.ratedAcKw,
    maxPvInputKw: row.maxPvInputKw,
    backupSurgeKw: row.backupSurgeKw ?? row.ratedAcKw,
    maxParallelUnits: row.maxParallelUnits,
    peakEfficiencyPct: row.peakEfficiencyPct,
    unitPriceCentavos: row.unitPriceCentavos,
    isPriceConfirmed: row.isPriceConfirmed,
  };
}

export function mapBatteryFromDb(row: {
  id: string;
  sku: string;
  modelName: string;
  compatibleInverterFamily: string;
  nominalKwh: number;
  usableKwh: number;
  dodPct: number;
  roundTripEfficiencyPct: number;
  cycleLife: number;
  warrantyYears: number;
  unitPriceCentavos: number;
  isPriceConfirmed: boolean;
}): BatterySpec {
  return {
    id: row.id,
    sku: row.sku,
    modelName: row.modelName,
    compatibleInverterFamily: row.compatibleInverterFamily,
    nominalKwh: row.nominalKwh,
    usableKwh: row.usableKwh,
    dodPct: row.dodPct,
    roundTripEfficiencyPct: row.roundTripEfficiencyPct,
    cycleLife: row.cycleLife,
    warrantyYears: row.warrantyYears,
    unitPriceCentavos: row.unitPriceCentavos,
    isPriceConfirmed: row.isPriceConfirmed,
  };
}
