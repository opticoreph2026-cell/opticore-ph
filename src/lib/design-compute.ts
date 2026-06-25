/**
 * @file src/lib/design-compute.ts
 * @description Orchestrates solar-design.ts engine with catalog data.
 * Pure functions — no DB calls. Money values in pesos (Decimal(10,2)).
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
  averageMonthlyBill: number;
  gridConnectionType: GridConnectionType;
  designPathway: DesignPathway;
  customerType: string;
  peakSunHours: number;
  targetOffsetPct: number;
  panelWattage: number;
  backupAutonomyHours: number;
  criticalLoads: CriticalLoad[];
  availableRoofAreaSqm?: number;
  /** Override defaults from DB fee config */
  panelPrice?: number;
  installationFeePct?: number;
  designFee?: number;
  permitFee?: number;
}

/** Placeholder distributor pricing when catalog `isPriceConfirmed` is false (in pesos) */
export const ESTIMATED_UNIT_PRICES: Record<string, number> = {
  'BW-INV-SPH3.6K': 85000,
  'BW-INV-SPH5K': 105000,
  'BW-INV-SPH6K': 125000,
  'BW-INV-SPH8K': 155000,
  'BW-INV-TPH4K': 120000,
  'BW-INV-TPH6K': 145000,
  'BW-INV-TPH8K': 170000,
  'BW-INV-TPH10K': 210000,
  'BW-INV-TPH12K': 250000,
  'BW-INV-TPH15K': 300000,
  'BW-INV-SPB5K': 95000,
  'BW-BAT-4.8S': 65000,
  'BW-BAT-9.6P': 115000,
  'BW-BAT-10.1P': 125000,
};

export const ESTIMATED_PANEL_PRICE = 7500; // ₱7,500 per 550W panel
export const ESTIMATED_INSTALLATION_PCT = 0.15;
export const ESTIMATED_DESIGN_FEE = 15000; // ₱15,000
export const ESTIMATED_PERMIT_FEE = 25000; // ₱25,000

export interface BomLineItem {
  itemType: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  total: number;
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
  hardwareSubtotal: number;
  installationFee: number;
  designFee: number;
  permitFee: number;
  grandTotal: number;
  trace: Record<string, unknown>;
}

function resolveUnitPrice(spec: { sku: string; unitPrice: number; isPriceConfirmed: boolean }): number {
  if (spec.isPriceConfirmed && spec.unitPrice > 0) return spec.unitPrice;
  return ESTIMATED_UNIT_PRICES[spec.sku] ?? 0;
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
  const panelUnit = input.panelPrice ?? ESTIMATED_PANEL_PRICE;

  const bom: BomLineItem[] = [
    {
      itemType: 'panel',
      description: `Solar PV Module ${input.panelWattage}W`,
      quantity: pv.panelCount,
      unit: 'pc',
      unitCost: panelUnit,
      total: panelUnit * pv.panelCount,
      source: 'third_party',
    },
    {
      itemType: 'inverter',
      description: selection.inverter.modelName,
      quantity: selection.inverterQuantity,
      unit: 'pc',
      unitCost: inverterUnit,
      total: inverterUnit * selection.inverterQuantity,
      source: 'neovolt_catalog',
    },
    {
      itemType: 'battery',
      description: selection.battery.modelName,
      quantity: selection.batteryQuantity,
      unit: 'pc',
      unitCost: batteryUnit,
      total: batteryUnit * selection.batteryQuantity,
      source: 'neovolt_catalog',
    },
    {
      itemType: 'mounting',
      description: 'Mounting, BOS, cabling & breakers',
      quantity: 1,
      unit: 'lot',
      unitCost: Math.round(pv.pvArrayKwp * 3500),
      total: Math.round(pv.pvArrayKwp * 3500),
      source: 'third_party',
    },
  ];

  const hardwareSubtotal = bom.reduce((s, i) => s + i.total, 0);
  const installPct = input.installationFeePct ?? ESTIMATED_INSTALLATION_PCT;
  const installationFee = Math.round(hardwareSubtotal * installPct);
  const designFee = input.designFee ?? ESTIMATED_DESIGN_FEE;
  const permitFee = input.permitFee ?? ESTIMATED_PERMIT_FEE;
  const grandTotal = hardwareSubtotal + installationFee + designFee + permitFee;

  return {
    pv,
    backup,
    selection,
    cabling,
    sld,
    annualYieldKwh,
    bom,
    hardwareSubtotal,
    installationFee,
    designFee,
    permitFee,
    grandTotal,
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
  unitPrice: number;
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
    unitPrice: row.unitPrice,
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
  unitPrice: number;
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
    unitPrice: row.unitPrice,
    isPriceConfirmed: row.isPriceConfirmed,
  };
}
