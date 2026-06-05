export interface WaterRateSnapshot {
  lifelineMax: number // cu.m
  lifelineRate: number // centavos per cu.m
  block1Max: number
  block1Rate: number
  block2Max: number
  block2Rate: number
  block3Rate: number
  environmentalCharge: number // centavos per cu.m
  maintenanceCharge: number // fixed centavos
  vatRate: number // rate units e.g. 1200
}

export interface WaterVerificationResult {
  totalExpectedCentavos: number
  isLifeline: boolean
  breakdown: {
    basicCharge: number
    environmentalCharge: number
    maintenanceCharge: number
    vat: number
  }
}

/**
 * Calculates the expected water bill based on MWSS/NWRB block rates
 * 
 * @param consumption in cubic meters
 * @param rates The active water rates
 * @returns WaterVerificationResult
 */
export function calculateExpectedWaterBill(
  consumption: number,
  rates: WaterRateSnapshot
): WaterVerificationResult {
  let basicCharge = 0
  let isLifeline = false

  // Basic Charge is calculated using block tiers
  if (consumption <= rates.lifelineMax) {
    isLifeline = true
    basicCharge = consumption * rates.lifelineRate
  } else {
    // Progressive blocks
    // Block 1 (0 to block1Max)
    const b1Consumption = Math.min(consumption, rates.block1Max)
    basicCharge += b1Consumption * rates.block1Rate

    // Block 2 (block1Max to block2Max)
    if (consumption > rates.block1Max) {
      const b2Consumption = Math.min(consumption - rates.block1Max, rates.block2Max - rates.block1Max)
      basicCharge += b2Consumption * rates.block2Rate
    }

    // Block 3 (above block2Max)
    if (consumption > rates.block2Max) {
      const b3Consumption = consumption - rates.block2Max
      basicCharge += b3Consumption * rates.block3Rate
    }
  }

  // Surcharges
  const environmentalCharge = consumption * rates.environmentalCharge
  const maintenanceCharge = rates.maintenanceCharge

  const subtotal = basicCharge + environmentalCharge + maintenanceCharge

  // VAT
  const vat = Math.round(subtotal * (rates.vatRate / 10000))

  const totalExpectedCentavos = subtotal + vat

  return {
    totalExpectedCentavos,
    isLifeline,
    breakdown: {
      basicCharge,
      environmentalCharge,
      maintenanceCharge,
      vat
    }
  }
}
