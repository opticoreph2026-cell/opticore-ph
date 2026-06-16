import { calculateChargeCentavos } from './money'

export interface ERCRateSnapshot {
  generationRate: number
  transmissionRate: number
  distributionRate: number
  supplyCharge: number
  meteringCharge: number
  systemLossRate: number
  universalCharges: number
  fitAllCharge: number
  franchiseTaxRate: number
  vatRate: number
  lifelineThreshold: number
  lifelineDiscount: number // in rate units representing percentage e.g. 2000 = 20%
}

export interface ERCVerificationResult {
  totalExpectedCentavos: number
  isLifeline: boolean
  breakdown: {
    generation: number
    transmission: number
    distribution: number
    supply: number
    metering: number
    systemLoss: number
    universal: number
    fitAll: number
    franchiseTax: number
    vat: number
    lifelineSubsidy: number // Or discount
  }
}

/**
 * Calculates the expected electric bill according to ERC standards
 * 
 * @param consumption in kWh
 * @param rates The active ERC rates for the month
 * @returns ERCVerificationResult
 */
export function calculateExpectedElectricBill(
  consumption: number,
  rates: ERCRateSnapshot
): ERCVerificationResult {
  // 1. Core Energy Charges
  const generation = calculateChargeCentavos(rates.generationRate, consumption)
  const transmission = calculateChargeCentavos(rates.transmissionRate, consumption)
  const distribution = calculateChargeCentavos(rates.distributionRate, consumption)
  const supply = calculateChargeCentavos(rates.supplyCharge, consumption)
  const metering = calculateChargeCentavos(rates.meteringCharge, consumption)
  const systemLoss = calculateChargeCentavos(rates.systemLossRate, consumption)
  
  // 2. Fixed/Statutory Charges
  const universal = calculateChargeCentavos(rates.universalCharges, consumption)
  const fitAll = calculateChargeCentavos(rates.fitAllCharge, consumption)
  
  // Subtotal before taxes and lifeline
  const subtotal = generation + transmission + distribution + supply + metering + systemLoss
  
  // 3. Lifeline Discount / Subsidy
  let lifelineSubsidy = 0
  const isLifeline = consumption <= rates.lifelineThreshold
  
  if (isLifeline && rates.lifelineDiscount > 0) {
    // Note: Lifeline discount usually applies to Generation, Transmission, System Loss, Distribution, Supply, Metering
    const discountPercent = rates.lifelineDiscount / 10000
    lifelineSubsidy = -Math.round(subtotal * discountPercent)
  } else {
    // If not lifeline, you often pay a lifeline subsidy charge (simplified here)
    // Actually, lifeline subsidy rate is usually part of Universal Charges or a separate rate.
    // For OptiCore phase 1, we'll keep it simple: 0 if not lifeline, unless provided in universal.
  }

  const taxableAmount = subtotal + lifelineSubsidy

  // 4. Taxes
  const franchiseTax = Math.round(taxableAmount * (rates.franchiseTaxRate / 10000))
  // VAT usually applies to Generation, Transmission, Distribution, System loss
  const vat = Math.round(taxableAmount * (rates.vatRate / 10000))

  const totalExpectedCentavos = subtotal + lifelineSubsidy + universal + fitAll + franchiseTax + vat

  return {
    totalExpectedCentavos,
    isLifeline,
    breakdown: {
      generation,
      transmission,
      distribution,
      supply,
      metering,
      systemLoss,
      universal,
      fitAll,
      franchiseTax,
      vat,
      lifelineSubsidy
    }
  }
}
