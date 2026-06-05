/**
 * OptiCore PH — Money Utilities
 * 
 * Non-Negotiable Rule:
 * All money amounts are stored in the database as Integers representing centavos (₱ * 100).
 * All rate units are stored as Integers representing ₱/kWh * 10,000.
 *
 * NEVER use floating point math for money.
 */

/**
 * Converts a float peso amount to integer centavos for DB storage
 * @param {number} pesos ₱123.45
 * @returns {number} 12345
 */
export function pesosToCentavos(pesos: number): number {
  return Math.round(pesos * 100)
}

/**
 * Converts integer centavos from DB to float peso for UI/calculations
 * @param {number} centavos 12345
 * @returns {number} 123.45
 */
export function centavosToPesos(centavos: number): number {
  return centavos / 100
}

/**
 * Formats integer centavos as a Philippine Peso string
 * @param {number} centavos 12345
 * @returns {string} "₱123.45"
 */
export function formatCentavosToPHP(centavos: number): string {
  const pesos = centavos / 100
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(pesos)
}

/**
 * Converts a float rate to integer rate units for DB storage
 * @param {number} rate ₱11.4567
 * @returns {number} 114567
 */
export function rateToUnits(rate: number): number {
  return Math.round(rate * 10000)
}

/**
 * Converts integer rate units from DB to float rate
 * @param {number} units 114567
 * @returns {number} 11.4567
 */
export function unitsToRate(units: number): number {
  return units / 10000
}

/**
 * Formats integer rate units as a Philippine Peso rate string
 * @param {number} units 114567
 * @returns {string} "₱11.4567"
 */
export function formatUnitsToRatePHP(units: number): string {
  const rate = units / 10000
  return `₱${rate.toFixed(4)}`
}

/**
 * Calculates the total cost based on rate units and consumption
 * @param {number} rateUnits ₱/kWh * 10,000 (e.g. 114567)
 * @param {number} consumption kWh (e.g. 100)
 * @returns {number} centavos (e.g. 114567) -> (11.4567 * 100) * 100 = 114567
 */
export function calculateChargeCentavos(rateUnits: number, consumption: number): number {
  // Rate is per unit.
  // rateUnits / 10000 = rate in pesos
  // rate in pesos * consumption = total in pesos
  // total in pesos * 100 = centavos
  // So: (rateUnits / 10000) * consumption * 100 = rateUnits * consumption / 100
  return Math.round((rateUnits * consumption) / 100)
}
