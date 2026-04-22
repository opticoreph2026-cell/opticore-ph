import { calculateApplianceKwh, calculateTheoreticalWaterM3 } from './engineeringMath';

/**
 * OptiCore PH - Attribution Engine
 * 
 * Logic to map total utility consumption to specific appliance categories
 * and detect "Ghost Loads" (unexplained consumption).
 */

export interface AttributionResult {
  unit: 'kWh' | 'm3';
  totalEstimated: number;
  actual: number;
  categories: {
    [key: string]: {
      value: number;
      percentageOfTotal: number;
      percentageOfEstimated: number;
    };
  };
  discrepancy: {
    value: number;
    percentage: number;
  };
  severity: 'NORMAL' | 'LEAKING' | 'CRITICAL';
}

/**
 * Performs attribution analysis on a bill.
 */
export function calculateAttribution(
  actualKwh: number,
  appliances: Array<{ 
    wattage: number | null; 
    hoursPerDay: number | null; 
    category: string; 
    energyRating?: string;
    quantity: number;
  }>
): AttributionResult {
  const categories: AttributionResult['categories'] = {};
  let totalEstimatedKwh = 0;

  // 1. Calculate Theoretical Consumption per Appliance
  appliances.forEach((app) => {
    if (!app.wattage || !app.hoursPerDay) return;

    const isInverter = app.energyRating?.toLowerCase().includes('inverter') || false;
    const unitKwh = calculateApplianceKwh(
      app.wattage, 
      app.hoursPerDay, 
      app.category, 
      isInverter
    );
    
    const totalApplianceKwh = unitKwh * (app.quantity || 1);
    totalEstimatedKwh += totalApplianceKwh;

    if (!categories[app.category]) {
      categories[app.category] = { value: 0, percentageOfTotal: 0, percentageOfEstimated: 0 };
    }
    categories[app.category].value += totalApplianceKwh;
  });

  // 2. Calculate Percentages and Ghost Load
  const ghostLoadKwh = Math.max(0, actualKwh - totalEstimatedKwh);
  const ghostLoadPercentage = actualKwh > 0 ? (ghostLoadKwh / actualKwh) * 100 : 0;

  // Finalize category summaries
  Object.keys(categories).forEach((cat) => {
    categories[cat].percentageOfTotal = actualKwh > 0 
      ? Number(((categories[cat].value / actualKwh) * 100).toFixed(1))
      : 0;
    
    categories[cat].percentageOfEstimated = totalEstimatedKwh > 0
      ? Number(((categories[cat].value / totalEstimatedKwh) * 100).toFixed(1))
      : 0;
  });

  // 3. Determine Leakage Severity
  let severity: AttributionResult['severity'] = 'NORMAL';
  if (ghostLoadPercentage > 40) severity = 'CRITICAL';
  else if (ghostLoadPercentage > 15) severity = 'LEAKING';

  return {
    unit: 'kWh',
    totalEstimated: Number(totalEstimatedKwh.toFixed(2)),
    actual: actualKwh,
    categories,
    discrepancy: {
      value: Number(ghostLoadKwh.toFixed(2)),
      percentage: Number(ghostLoadPercentage.toFixed(1)),
    },
    severity,
  };
}

/**
 * Performs attribution analysis on a water bill.
 */
export function calculateWaterAttribution(
  actualM3: number,
  householdSize: number = 1
): AttributionResult {
  const theoreticalM3 = calculateTheoreticalWaterM3(householdSize);
  const leakageM3 = Math.max(0, actualM3 - theoreticalM3);
  const leakagePercentage = actualM3 > 0 ? (leakageM3 / actualM3) * 100 : 0;

  let severity: AttributionResult['severity'] = 'NORMAL';
  if (leakagePercentage > 30) severity = 'CRITICAL';
  else if (leakagePercentage > 10) severity = 'LEAKING';

  return {
    unit: 'm3',
    totalEstimated: theoreticalM3,
    actual: actualM3,
    categories: {
      "Household Demand": {
        value: theoreticalM3,
        percentageOfTotal: actualM3 > 0 ? Number(((theoreticalM3 / actualM3) * 100).toFixed(1)) : 100,
        percentageOfEstimated: 100
      }
    },
    discrepancy: {
      value: Number(leakageM3.toFixed(2)),
      percentage: Number(leakagePercentage.toFixed(1))
    },
    severity
  };
}
