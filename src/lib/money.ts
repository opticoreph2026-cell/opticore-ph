/**
 * OptiCore PH — Money Utility
 *
 * WHY INTEGER STORAGE?
 * SQLite/LibSQL does not support Decimal natively. Storing money as Float leads
 * to IEEE-754 drift (₱1,100.10 → 1100.0999999...). We follow the Stripe/PayMongo
 * pattern: all monetary amounts stored as integers (centavos), all rates stored
 * as integers (rate units = peso-per-kWh × 10,000 for 4-decimal precision).
 *
 * Conversion boundary: ONLY at the API response layer (toPeso) and the write
 * layer (toCentavos). The database never sees a float for money.
 *
 * Examples:
 *   ₱4,200.50 → stored as 420050 centavos
 *   ₱11.4250/kWh → stored as 114250 rate units
 */

// ─── Amount Helpers (₱ ↔ centavos) ──────────────────────────────────────────

/**
 * Convert a peso amount to centavos for DB storage.
 * Rounds to nearest centavo to eliminate float noise.
 */
export function toCentavos(peso: number): number {
  return Math.round(peso * 100);
}

/**
 * Convert centavos from DB back to a peso float for display/calculations.
 */
export function toPeso(centavos: number): number {
  return centavos / 100;
}

/**
 * Format centavos as a Philippine Peso string.
 * @example formatPHP(420050) → "₱4,200.50"
 */
export function formatPHP(centavos: number): string {
  return `₱${(centavos / 100).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format centavos as a compact string for small spaces.
 * @example formatPHPCompact(420050) → "₱4.2K"
 */
export function formatPHPCompact(centavos: number): string {
  const peso = centavos / 100;
  if (peso >= 1_000_000) return `₱${(peso / 1_000_000).toFixed(1)}M`;
  if (peso >= 1_000) return `₱${(peso / 1_000).toFixed(1)}K`;
  return formatPHP(centavos);
}

// ─── Rate Helpers (₱/kWh ↔ rate units) ──────────────────────────────────────
// Rate unit = peso-per-kWh × 10,000 → 4 decimal places of precision.
// ₱11.4250/kWh → 114250 rate units

/**
 * Convert a ₱/kWh rate to integer rate units for DB storage.
 * @example toRateUnits(11.4250) → 114250
 */
export function toRateUnits(ratePerKwh: number): number {
  return Math.round(ratePerKwh * 10_000);
}

/**
 * Convert stored rate units back to ₱/kWh float.
 * @example fromRateUnits(114250) → 11.425
 */
export function fromRateUnits(units: number): number {
  return units / 10_000;
}

/**
 * Format rate units as a human-readable ₱/kWh string.
 * @example formatRate(114250) → "₱11.4250/kWh"
 */
export function formatRate(units: number): string {
  return `₱${(units / 10_000).toFixed(4)}/kWh`;
}

// ─── Derived Calculations ─────────────────────────────────────────────────────

/**
 * Calculate effective rate from bill amount (centavos) and kWh usage.
 * Returns rate units (int). Safe to call with 0 kWh (returns 0).
 */
export function calcEffectiveRate(billCentavos: number, kwhUsed: number): number {
  if (kwhUsed <= 0) return 0;
  const pesoPerKwh = billCentavos / 100 / kwhUsed;
  return toRateUnits(pesoPerKwh);
}

/**
 * Estimate monthly bill from wattage, hours, and rate units.
 * Returns centavos.
 */
export function estimateMonthlyBill(
  wattage: number,
  hoursPerDay: number,
  rateUnits: number,
  daysPerMonth = 30,
): number {
  const kwhPerMonth = (wattage / 1000) * hoursPerDay * daysPerMonth;
  const pesoPerKwh = fromRateUnits(rateUnits);
  return toCentavos(kwhPerMonth * pesoPerKwh);
}

// ─── Safe Parsing ─────────────────────────────────────────────────────────────

/**
 * Safely parse a value as centavos. Accepts:
 * - Number (treated as peso if < 1000 and no explicit flag, else centavos)
 * - String peso amount ("₱1,100.50" or "1100.50")
 * Returns 0 on invalid input. Use only at API input boundaries.
 */
export function parsePesoCentavos(raw: unknown): number {
  if (raw == null) return 0;
  const str = String(raw).replace(/[₱,\s]/g, '');
  const float = parseFloat(str);
  if (isNaN(float)) return 0;
  return toCentavos(float);
}
