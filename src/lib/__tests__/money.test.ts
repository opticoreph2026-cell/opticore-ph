/**
 * Unit tests for src/lib/money.ts
 * Run with: npx tsx --test src/lib/__tests__/money.test.ts
 * (uses Node.js built-in test runner via tsx)
 */

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import {
  toCentavos,
  toPeso,
  formatPHP,
  formatPHPCompact,
  toRateUnits,
  fromRateUnits,
  formatRate,
  calcEffectiveRate,
  estimateMonthlyBill,
  parsePesoCentavos,
} from '../money.js';

// ─── toCentavos ──────────────────────────────────────────────────────────────
describe('toCentavos', () => {
  it('converts whole peso amounts', () => {
    assert.strictEqual(toCentavos(100), 10000);
    assert.strictEqual(toCentavos(0), 0);
    assert.strictEqual(toCentavos(1), 100);
  });

  it('converts peso amounts with centavos', () => {
    assert.strictEqual(toCentavos(4200.50), 420050);
    assert.strictEqual(toCentavos(1100.10), 110010);
  });

  it('rounds to nearest centavo (no float drift)', () => {
    // 0.1 + 0.2 = 0.30000000000000004 in IEEE-754
    assert.strictEqual(toCentavos(0.1 + 0.2), 30);
  });
});

// ─── toPeso ──────────────────────────────────────────────────────────────────
describe('toPeso', () => {
  it('converts centavos to peso', () => {
    assert.strictEqual(toPeso(420050), 4200.5);
    assert.strictEqual(toPeso(10000), 100);
    assert.strictEqual(toPeso(0), 0);
    assert.strictEqual(toPeso(1), 0.01);
  });

  it('round-trips correctly', () => {
    const original = 4200.50;
    assert.strictEqual(toPeso(toCentavos(original)), original);
  });
});

// ─── formatPHP ───────────────────────────────────────────────────────────────
describe('formatPHP', () => {
  it('formats with peso sign and 2 decimals', () => {
    assert.ok(formatPHP(420050).includes('₱'));
    assert.ok(formatPHP(420050).includes('4,200.50'));
  });

  it('formats zero correctly', () => {
    assert.strictEqual(formatPHP(0), '₱0.00');
  });

  it('formats 1 centavo', () => {
    assert.ok(formatPHP(1).includes('0.01'));
  });
});

// ─── formatPHPCompact ────────────────────────────────────────────────────────
describe('formatPHPCompact', () => {
  it('uses K suffix for thousands', () => {
    assert.ok(formatPHPCompact(420000).includes('K'));
  });

  it('uses M suffix for millions', () => {
    assert.ok(formatPHPCompact(100_000_000).includes('M'));
  });

  it('falls back to full format for small amounts', () => {
    assert.ok(formatPHPCompact(500).includes('5.00'));
  });
});

// ─── toRateUnits / fromRateUnits ─────────────────────────────────────────────
describe('toRateUnits', () => {
  it('converts 11.4250/kWh to 114250', () => {
    assert.strictEqual(toRateUnits(11.4250), 114250);
  });

  it('converts 0 rate', () => {
    assert.strictEqual(toRateUnits(0), 0);
  });
});

describe('fromRateUnits', () => {
  it('converts 114250 back to 11.425', () => {
    assert.strictEqual(fromRateUnits(114250), 11.425);
  });

  it('round-trips correctly', () => {
    const rate = 11.4250;
    assert.strictEqual(fromRateUnits(toRateUnits(rate)), rate);
  });
});

// ─── formatRate ──────────────────────────────────────────────────────────────
describe('formatRate', () => {
  it('formats rate units as ₱/kWh string', () => {
    const formatted = formatRate(114250);
    assert.ok(formatted.includes('₱'));
    assert.ok(formatted.includes('11.4250'));
    assert.ok(formatted.includes('/kWh'));
  });
});

// ─── calcEffectiveRate ───────────────────────────────────────────────────────
describe('calcEffectiveRate', () => {
  it('calculates correct rate from bill and kWh', () => {
    // ₱2,285 bill / 200 kWh = ₱11.425/kWh = 114250 rate units
    assert.strictEqual(calcEffectiveRate(228500, 200), 114250);
  });

  it('returns 0 for zero kWh (no division by zero)', () => {
    assert.strictEqual(calcEffectiveRate(100000, 0), 0);
  });

  it('returns 0 for negative kWh', () => {
    assert.strictEqual(calcEffectiveRate(100000, -5), 0);
  });
});

// ─── estimateMonthlyBill ─────────────────────────────────────────────────────
describe('estimateMonthlyBill', () => {
  it('calculates monthly AC bill correctly', () => {
    // 1500W AC, 8h/day, ₱11.4250/kWh, 30 days
    // kWh = 1.5 * 8 * 30 = 360 kWh
    // bill = 360 * 11.425 = ₱4,113 = 411300 centavos
    const result = estimateMonthlyBill(1500, 8, 114250, 30);
    assert.strictEqual(result, 411300);
  });

  it('returns 0 for zero wattage', () => {
    assert.strictEqual(estimateMonthlyBill(0, 8, 114250), 0);
  });
});

// ─── parsePesoCentavos ───────────────────────────────────────────────────────
describe('parsePesoCentavos', () => {
  it('parses peso string with sign', () => {
    assert.strictEqual(parsePesoCentavos('₱4,200.50'), 420050);
  });

  it('parses plain number string', () => {
    assert.strictEqual(parsePesoCentavos('1100.50'), 110050);
  });

  it('parses numeric input', () => {
    assert.strictEqual(parsePesoCentavos(11.50), 1150);
  });

  it('returns 0 for null/undefined', () => {
    assert.strictEqual(parsePesoCentavos(null), 0);
    assert.strictEqual(parsePesoCentavos(undefined), 0);
  });

  it('returns 0 for invalid string', () => {
    assert.strictEqual(parsePesoCentavos('not-a-number'), 0);
  });
});
