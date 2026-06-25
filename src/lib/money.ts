/** Money is stored as Decimal(10,2) pesos. No cents/centavos conversion needed. */

export function roundMoney(v: number): number {
  return Math.round(v * 100) / 100
}

export function formatPHP(v: number): string {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(v)
}

/** Rate units: ₱/kWh × 10,000 (stored as Int) — for utility rates only */
export function rateToUnits(rate: number): number {
  return Math.round(rate * 10000)
}

export function unitsToRate(units: number): number {
  return units / 10000
}

export function formatUnitsToRatePHP(units: number): string {
  return `₱${(units / 10000).toFixed(4)}`
}
