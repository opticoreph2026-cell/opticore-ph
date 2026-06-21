/**
 * @file src/lib/solar-design.ts
 * @description Solar & ESS Design/Sizing Engine — OptiCore Energy Solutions
 *
 * Implements Part F formulas from the platform specification.
 * All functions are PURE (no DB calls, no side effects) — unit-testable.
 * Money values: Int centavos (₱ × 100). Power in kW. Energy in kWh.
 *
 * Key rule from spec: This is NOT a black-box calculator — every output
 * must be traceable to an input + formula so the engineer can present it
 * live to a client on a tablet.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type GridConnectionType = 'single_phase' | 'three_phase';
export type DesignPathway = 'grid_tied_net_metered' | 'zero_export_hybrid' | 'off_grid';
export type SystemTier =
  | 'starter_residential'
  | 'standard_residential'
  | 'small_commercial'
  | 'medium_commercial'
  | 'off_grid_custom';
export type InverterFamily =
  | 'single_phase_aio'
  | 'three_phase_split'
  | 'ac_coupled_retrofit';

export interface CriticalLoad {
  name: string;
  watts: number;
  quantity: number;
  hoursPerDay: number;
  mustBackup: boolean;
}

export interface InverterSpec {
  id: string;
  sku: string;
  modelName: string;
  family: InverterFamily;
  phase: 1 | 3;
  ratedAcKw: number;
  maxPvInputKw: number;
  backupSurgeKw: number;
  maxParallelUnits: number;
  peakEfficiencyPct: number;
  unitPriceCentavos: number;
  isPriceConfirmed: boolean;
}

export interface BatterySpec {
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
}

export interface BackupSizingResult {
  totalCriticalLoadKw: number;
  requiredBackupEnergyKwh: number;
  requiredBatteryUsableKwh: number;  // after efficiency + safety margin
  requiredInverterKw: number;        // after surge factor
  /** Formula trace for client-facing display */
  trace: {
    loadItems: { name: string; watts: number; qty: number; hours: number; energyKwh: number }[];
    safetyMarginPct: number;
    surgeFactor: number;
    batteryRoundTripEffPct: number;
  };
}

export interface PvSizingResult {
  pvArrayKwp: number;
  panelCount: number;
  requiredRoofAreaSqm: number;
  estimatedAnnualYieldKwh: number;
  constraintViolation?: 'exceeds_max_pv_input' | 'exceeds_roof_area' | null;
  /** Formula trace */
  trace: {
    targetAnnualGenKwh: number;
    peakSunHours: number;
    systemDerate: number;
    panelWattage: number;
    perPanelAreaSqm: number;
    layoutFactor: number;
  };
}

export interface NeovoltSelection {
  inverter: InverterSpec;
  inverterQuantity: number;
  battery: BatterySpec;
  batteryQuantity: number;
  totalUsableStorageKwh: number;
  tier: SystemTier;
  isParallel: boolean;
  warningFlags: string[];
}

export interface CableSizingResult {
  continuousCurrentA: number;
  minAmpacityA: number;
  ocpdRatingA: number;
  recommendedCableAwg: string;
  recommendedCableMmSq: string;
  disclaimer: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Standard OCPD ratings (A) per PEC */
const STANDARD_OCPD_RATINGS = [15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 100, 125, 150, 175, 200];

/** THHN/THWN-2 copper ampacity table (A) → AWG / mm² at 75°C */
const CABLE_AMPACITY_TABLE: { ampacity: number; awg: string; mmSq: string }[] = [
  { ampacity: 20,  awg: '12 AWG', mmSq: '3.5 mm²'  },
  { ampacity: 25,  awg: '10 AWG', mmSq: '5.5 mm²'  },
  { ampacity: 30,  awg: '10 AWG', mmSq: '5.5 mm²'  },
  { ampacity: 40,  awg: '8 AWG',  mmSq: '8 mm²'    },
  { ampacity: 55,  awg: '6 AWG',  mmSq: '14 mm²'   },
  { ampacity: 70,  awg: '4 AWG',  mmSq: '22 mm²'   },
  { ampacity: 85,  awg: '3 AWG',  mmSq: '30 mm²'   },
  { ampacity: 95,  awg: '2 AWG',  mmSq: '38 mm²'   },
  { ampacity: 130, awg: '1 AWG',  mmSq: '50 mm²'   },
  { ampacity: 150, awg: '1/0 AWG',mmSq: '60 mm²'   },
  { ampacity: 175, awg: '2/0 AWG',mmSq: '70 mm²'   },
  { ampacity: 200, awg: '3/0 AWG',mmSq: '95 mm²'   },
  { ampacity: 230, awg: '4/0 AWG',mmSq: '120 mm²'  },
];

// ─── F.2 Critical-Load Backup Sizing ─────────────────────────────────────────

/**
 * Compute the minimum battery bank and inverter size needed to support
 * all flagged critical loads for the desired autonomy period.
 *
 * Formula (Part F.2 of spec):
 *   Total Critical Load (kW)     = Σ (watts × qty) / 1000
 *   Required Backup Energy (kWh) = Σ (watts × qty × hours) / 1000
 *   Battery Bank (usable kWh)    ≥ Required / roundTripEff × (1 + safetyMargin)
 *   Inverter kW                  ≥ Total Critical Load × surgeFactor
 */
export function computeCriticalBackupRequirements(
  loads: CriticalLoad[],
  batteryRoundTripEffPct: number = 95,
  safetyMarginPct: number = 15,
  surgeFactor: number = 1.25,
): BackupSizingResult {
  const criticalLoads = loads.filter((l) => l.mustBackup);

  const loadItems = criticalLoads.map((l) => ({
    name: l.name,
    watts: l.watts,
    qty: l.quantity,
    hours: l.hoursPerDay,
    energyKwh: (l.watts * l.quantity * l.hoursPerDay) / 1000,
  }));

  const totalCriticalLoadKw = criticalLoads.reduce(
    (sum, l) => sum + (l.watts * l.quantity) / 1000,
    0,
  );

  const requiredBackupEnergyKwh = loadItems.reduce((sum, i) => sum + i.energyKwh, 0);

  const rtEff = batteryRoundTripEffPct / 100;
  const margin = 1 + safetyMarginPct / 100;
  const requiredBatteryUsableKwh = (requiredBackupEnergyKwh / rtEff) * margin;

  const requiredInverterKw = totalCriticalLoadKw * surgeFactor;

  return {
    totalCriticalLoadKw,
    requiredBackupEnergyKwh,
    requiredBatteryUsableKwh,
    requiredInverterKw,
    trace: {
      loadItems,
      safetyMarginPct,
      surgeFactor,
      batteryRoundTripEffPct,
    },
  };
}

// ─── F.3 Bill-Offset PV Array Sizing ─────────────────────────────────────────

/**
 * Compute the PV array size needed to offset a target percentage of
 * the customer's annual electricity consumption.
 *
 * Formula (Part F.3 of spec):
 *   Target Annual Generation = MonthlyKwh × 12 × TargetOffset%
 *   PV Array kWp = TargetGeneration / (PSH × 365 × DerateFactore)
 *   Panel Count  = ceil(kWp × 1000 / panelWattage)
 *   Roof Area    = panelCount × perPanelSqm × layoutFactor
 */
export function computePvArraySize(params: {
  averageMonthlyKwh: number;
  targetOffsetPct: number;       // e.g., 80 for 80%
  peakSunHours: number;          // default 5.1 for Visayas
  systemDerateFactorPct: number; // e.g., 78 for 78%
  panelWattage: number;          // e.g., 550
  maxInverterPvInputKw?: number; // cap from selected inverter (optional)
  availableRoofAreaSqm?: number; // site survey (optional)
  perPanelAreaSqm?: number;      // default 1.95 m²
  layoutFactor?: number;         // default 1.4
}): PvSizingResult {
  const {
    averageMonthlyKwh,
    targetOffsetPct,
    peakSunHours,
    systemDerateFactorPct,
    panelWattage,
    maxInverterPvInputKw,
    availableRoofAreaSqm,
    perPanelAreaSqm = 1.95,
    layoutFactor = 1.4,
  } = params;

  const derate = systemDerateFactorPct / 100;
  const targetAnnualGenKwh = averageMonthlyKwh * 12 * (targetOffsetPct / 100);
  const pvArrayKwp = targetAnnualGenKwh / (peakSunHours * 365 * derate);
  const panelCount = Math.ceil((pvArrayKwp * 1000) / panelWattage);
  const actualKwp = (panelCount * panelWattage) / 1000;
  const requiredRoofAreaSqm = panelCount * perPanelAreaSqm * layoutFactor;
  const estimatedAnnualYieldKwh = actualKwp * peakSunHours * 365 * derate;

  let constraintViolation: PvSizingResult['constraintViolation'] = null;
  if (maxInverterPvInputKw && actualKwp > maxInverterPvInputKw) {
    constraintViolation = 'exceeds_max_pv_input';
  } else if (availableRoofAreaSqm && requiredRoofAreaSqm > availableRoofAreaSqm) {
    constraintViolation = 'exceeds_roof_area';
  }

  return {
    pvArrayKwp: actualKwp,
    panelCount,
    requiredRoofAreaSqm,
    estimatedAnnualYieldKwh,
    constraintViolation,
    trace: {
      targetAnnualGenKwh,
      peakSunHours,
      systemDerate: derate,
      panelWattage,
      perPanelAreaSqm,
      layoutFactor,
    },
  };
}

// ─── F.4 System Tier Resolution ───────────────────────────────────────────────

/**
 * Select the smallest valid Neovolt configuration from the product catalog
 * that satisfies both the PV array size and battery bank requirements.
 *
 * Priority rules (Part F.4):
 * 1. Single-unit solutions preferred over parallel stacks
 * 2. Single-phase AIO for residential/single-phase sites
 * 3. Three-phase split for any three-phase or commercial load
 * 4. Max 6 units in parallel per spec (Part B1.2)
 */
export function selectNeovoltConfiguration(params: {
  requiredPvKwp: number;
  requiredBatteryUsableKwh: number;
  requiredInverterKw: number;
  gridConnectionType: GridConnectionType;
  customerType: string;
  inverters: InverterSpec[];
  batteries: BatterySpec[];
}): NeovoltSelection | null {
  const {
    requiredPvKwp,
    requiredBatteryUsableKwh,
    requiredInverterKw,
    gridConnectionType,
    customerType,
    inverters,
    batteries,
  } = params;

  const warnings: string[] = [];
  const preferredPhase = gridConnectionType === 'three_phase' ? 3 : 1;
  const preferredFamily: InverterFamily =
    gridConnectionType === 'three_phase' ? 'three_phase_split' : 'single_phase_aio';

  // Filter active inverters by preferred family/phase
  const eligibleInverters = inverters
    .filter((inv) => inv.family === preferredFamily && inv.phase === preferredPhase)
    .sort((a, b) => a.ratedAcKw - b.ratedAcKw);

  if (eligibleInverters.length === 0) {
    warnings.push('No inverters available for the selected grid type — check product catalog.');
    return null;
  }

  // Find the smallest inverter configuration (single-unit first, then parallel)
  let selectedInverter: InverterSpec | null = null;
  let inverterQty = 1;

  for (const inv of eligibleInverters) {
    if (inv.ratedAcKw >= requiredInverterKw && inv.maxPvInputKw >= requiredPvKwp) {
      selectedInverter = inv;
      inverterQty = 1;
      break;
    }
  }

  // Try parallel if single unit insufficient
  if (!selectedInverter) {
    const largestInv = eligibleInverters[eligibleInverters.length - 1];
    if (largestInv) {
      const neededQty = Math.ceil(
        Math.max(requiredInverterKw / largestInv.ratedAcKw, requiredPvKwp / largestInv.maxPvInputKw),
      );
      if (neededQty <= largestInv.maxParallelUnits) {
        selectedInverter = largestInv;
        inverterQty = neededQty;
        warnings.push(
          `Multi-inverter parallel configuration required: ${neededQty}× ${largestInv.modelName}.`,
        );
      } else {
        warnings.push(
          `Load exceeds maximum parallel configuration (${largestInv.maxParallelUnits} units). Custom engineering review required.`,
        );
        return null;
      }
    }
  }

  if (!selectedInverter) return null;

  // Check PV input cap per inverter × qty
  const totalMaxPv = selectedInverter.maxPvInputKw * inverterQty;
  if (requiredPvKwp > totalMaxPv) {
    warnings.push(
      `PV array ${requiredPvKwp.toFixed(1)} kWp exceeds inverter max PV input (${totalMaxPv.toFixed(1)} kWp). ` +
      `Admin override or system redesign required.`,
    );
  }

  // Find battery configuration
  const eligibleBatteries = batteries
    .filter(
      (b) =>
        b.compatibleInverterFamily === preferredFamily ||
        b.compatibleInverterFamily === 'both',
    )
    .sort((a, b) => a.usableKwh - b.usableKwh);

  if (eligibleBatteries.length === 0) {
    warnings.push('No compatible batteries found for this inverter family.');
    return null;
  }

  const preferredBattery = eligibleBatteries[0]!;
  const batteryQty = Math.ceil(requiredBatteryUsableKwh / preferredBattery.usableKwh);
  const totalUsableStorageKwh = batteryQty * preferredBattery.usableKwh;

  // Resolve tier
  const tier = resolveTier({
    gridConnectionType,
    customerType,
    inverterQty,
    totalUsableStorageKwh,
  });

  return {
    inverter: selectedInverter,
    inverterQuantity: inverterQty,
    battery: preferredBattery,
    batteryQuantity: batteryQty,
    totalUsableStorageKwh,
    tier,
    isParallel: inverterQty > 1,
    warningFlags: warnings,
  };
}

function resolveTier(params: {
  gridConnectionType: GridConnectionType;
  customerType: string;
  inverterQty: number;
  totalUsableStorageKwh: number;
}): SystemTier {
  const { gridConnectionType, customerType, inverterQty, totalUsableStorageKwh } = params;

  if (customerType === 'off_grid' || customerType === 'eastern_visayas') {
    return 'off_grid_custom';
  }
  if (gridConnectionType === 'three_phase' || customerType === 'medium_commercial') {
    return totalUsableStorageKwh >= 20 ? 'medium_commercial' : 'small_commercial';
  }
  if (customerType === 'small_commercial') return 'small_commercial';
  if (totalUsableStorageKwh < 12 && inverterQty === 1) return 'starter_residential';
  return 'standard_residential';
}

// ─── Annual PV Yield with Degradation ────────────────────────────────────────

/**
 * Compute annual PV yield for a given year accounting for panel degradation.
 * Year 0 = installation year (no degradation applied yet).
 */
export function computeAnnualPvYield(params: {
  pvArrayKwp: number;
  peakSunHours: number;
  systemDerateFactorPct: number;
  annualDegradationPct: number; // e.g., 0.6 for 0.6%/yr
  year: number;                 // 0-indexed
}): number {
  const { pvArrayKwp, peakSunHours, systemDerateFactorPct, annualDegradationPct, year } = params;
  const derate = systemDerateFactorPct / 100;
  const degradation = 1 - (annualDegradationPct / 100) * year;
  return pvArrayKwp * peakSunHours * 365 * derate * Math.max(degradation, 0.7); // floor 70%
}

// ─── F.5 Cable & Protection Sizing ───────────────────────────────────────────

/**
 * PEC-aligned cable and OCPD sizing for the inverter AC output circuit.
 *
 * Formula (Part F.5):
 *   Continuous Current (A)  = Rated kW × 1000 / (Voltage × PF)
 *   Min Ampacity (A)        = Continuous Current × 1.25   [continuous-load factor]
 *   OCPD Rating (A)         = next standard size ≥ Min Ampacity
 *
 * ALWAYS accompanied by the disclaimer that final drawings require
 * RME/REE/PEE seal before permit submission.
 */
export function computeCableSizing(params: {
  ratedKw: number;
  voltageV?: number;    // default 230V single-phase
  powerFactor?: number; // default 0.9
}): CableSizingResult {
  const { ratedKw, voltageV = 230, powerFactor = 0.9 } = params;

  const continuousCurrentA = (ratedKw * 1000) / (voltageV * powerFactor);
  const minAmpacityA = continuousCurrentA * 1.25;

  const ocpdRatingA =
    STANDARD_OCPD_RATINGS.find((r) => r >= minAmpacityA) ??
    STANDARD_OCPD_RATINGS[STANDARD_OCPD_RATINGS.length - 1]!;

  const cableEntry =
    CABLE_AMPACITY_TABLE.find((c) => c.ampacity >= minAmpacityA) ??
    CABLE_AMPACITY_TABLE[CABLE_AMPACITY_TABLE.length - 1]!;

  return {
    continuousCurrentA: Math.round(continuousCurrentA * 10) / 10,
    minAmpacityA: Math.round(minAmpacityA * 10) / 10,
    ocpdRatingA,
    recommendedCableAwg: cableEntry.awg,
    recommendedCableMmSq: cableEntry.mmSq,
    disclaimer:
      'Cable and OCPD sizing is indicative only and does not substitute for the final electrical drawings ' +
      'prepared and sealed by a Licensed Electrical/Mechanical Engineer (REE/PEE/RME) as required by the ' +
      'Philippine Electrical Code (PEC) and the relevant Local Government Unit (LGU) for permit issuance.',
  };
}

// ─── SLD Data Export ─────────────────────────────────────────────────────────

export interface SldData {
  /** Labeled values the engineer needs to complete the SLD in CAD */
  pvArrayKwp: number;
  panelCount: number;
  panelWattage: number;
  inverterModel: string;
  inverterQty: number;
  inverterRatedAcKw: number;
  batteryModel: string;
  batteryQty: number;
  batteryTotalUsableKwh: number;
  batteryVoltage: string;
  ocSizeAcSideA: number;
  cableAcSide: string;
  systemPathway: DesignPathway;
  engineerNote: string;
}

export function generateSldData(params: {
  pvKwp: number;
  panelCount: number;
  panelWattage: number;
  selection: NeovoltSelection;
  cabling: CableSizingResult;
  pathway: DesignPathway;
}): SldData {
  const { pvKwp, panelCount, panelWattage, selection, cabling, pathway } = params;

  // Battery voltage: BW-BAT-10.1P = 96V (high voltage); BW-BAT-4.8S/9.6P = 700V
  const batteryVoltage =
    selection.battery.compatibleInverterFamily === 'single_phase_aio' ? '96 Vdc (HV)' : '700 Vdc (HV)';

  return {
    pvArrayKwp: pvKwp,
    panelCount,
    panelWattage,
    inverterModel: selection.inverter.modelName,
    inverterQty: selection.inverterQuantity,
    inverterRatedAcKw: selection.inverter.ratedAcKw * selection.inverterQuantity,
    batteryModel: selection.battery.modelName,
    batteryQty: selection.batteryQuantity,
    batteryTotalUsableKwh: selection.totalUsableStorageKwh,
    batteryVoltage,
    ocSizeAcSideA: cabling.ocpdRatingA,
    cableAcSide: cabling.recommendedCableMmSq,
    systemPathway: pathway,
    engineerNote:
      'SLD data export only. Final single-line diagram must be prepared, checked, and sealed ' +
      'by a Licensed Electrical/Mechanical Engineer before submission to the LGU/DU.',
  };
}
