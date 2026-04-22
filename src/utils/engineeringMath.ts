/**
 * OptiCore PH - Core Physics & Engineering Math Engine
 * 
 * Specialized thermodynamic and electrical calculations for the 
 * Philippine utility market.
 */

// ── Duty Cycle Constants (Philippine Climate Defaults) ───────────────────────
export const DUTY_CYCLES = {
  AC_INVERTER: 0.55,     // Average 45% compressor downtime
  AC_NON_INVERTER: 0.80, // High cycling frequency in PH humidity
  REFRIGERATOR: 0.40,    // Constant cycling 24/7
  WATER_PUMP: 1.00,      // Usually runs at full load when active
  LIGHTING: 1.00,        // Passive load
  OTHER: 0.70,           // General default
  WATER_CAPITA_LITERS: 200 // Philippine standard per capita per day
};

/**
 * Calculates monthly kWh consumption for a specific appliance.
 * 
 * @param wattage - Nominal power in Watts
 * @param hoursPerDay - Average active hours per day
 * @param category - Appliance type for duty cycle selection
 * @param isInverter - Whether the unit uses inverter technology
 */
export function calculateApplianceKwh(
  wattage: number,
  hoursPerDay: number,
  category: string = 'other',
  isInverter: boolean = false
): number {
  let dutyCycle = DUTY_CYCLES.OTHER;

  const cat = category.toLowerCase();
  if (cat.includes('ac') || cat.includes('aircon')) {
    dutyCycle = isInverter ? DUTY_CYCLES.AC_INVERTER : DUTY_CYCLES.AC_NON_INVERTER;
  } else if (cat.includes('fridge') || cat.includes('ref')) {
    dutyCycle = DUTY_CYCLES.REFRIGERATOR;
  } else if (cat.includes('pump')) {
    dutyCycle = DUTY_CYCLES.WATER_PUMP;
  } else if (cat.includes('light')) {
    dutyCycle = DUTY_CYCLES.LIGHTING;
  }

  const dailyKwh = (wattage * hoursPerDay * dutyCycle) / 1000;
  return Number((dailyKwh * 30).toFixed(2)); // Standard 30-day billing month
}

/**
 * Calculates the true effective rate per kWh.
 * Captures generation + transmission + taxes.
 */
export function calculateEffectiveRate(totalBill: number, totalKwh: number): number {
  if (totalKwh <= 0) return 0;
  return Number((totalBill / totalKwh).toFixed(4));
}

/**
 * Calculates theoretical monthly water consumption in cubic meters (m³).
 * @param householdSize - Number of occupants
 */
export function calculateTheoreticalWaterM3(householdSize: number): number {
  const dailyLiters = householdSize * DUTY_CYCLES.WATER_CAPITA_LITERS;
  const monthlyM3 = (dailyLiters * 30) / 1000;
  return Number(monthlyM3.toFixed(2));
}

/**
 * Calculates the true effective rate per m³.
 */
export function calculateWaterRate(totalBill: number, totalM3: number): number {
  if (totalM3 <= 0) return 0;
  return Number((totalBill / totalM3).toFixed(2));
}

/**
 * Calculates the financial delta between predicted and actual costs.
 * Used for AI discrepancy detection.
 */
export function calculateFinancialDelta(
  estimatedCost: number,
  actualBill: number
): {
  delta: number;
  percentage: number;
  status: 'accurate' | 'divergent' | 'extreme';
} {
  const delta = actualBill - estimatedCost;
  const percentage = estimatedCost > 0 ? (delta / estimatedCost) * 100 : 0;

  let status: 'accurate' | 'divergent' | 'extreme' = 'accurate';
  if (Math.abs(percentage) > 30) status = 'extreme';
  else if (Math.abs(percentage) > 15) status = 'divergent';

  return {
    delta: Number(delta.toFixed(2)),
    percentage: Number(percentage.toFixed(1)),
    status
  };
}

/**
 * Estimates monthly bill based on an asset profile array.
 */
export function estimateMonthlyBill(
  appliances: Array<{ wattage: number; hoursPerDay: number; category: string; isInverter?: boolean }>,
  effectiveRate: number
): number {
  const totalKwh = appliances.reduce((sum, app) => {
    return sum + calculateApplianceKwh(app.wattage, app.hoursPerDay, app.category, app.isInverter);
  }, 0);

  return Number((totalKwh * effectiveRate).toFixed(2));
}
