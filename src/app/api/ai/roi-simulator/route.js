/**
 * POST /api/ai/roi-simulator
 * 
 * Hardware ROI Simulator — Calculates the financial return of upgrading
 * a household appliance based on real consumption data.
 *
 * Body: {
 *   currentWattage: number,       // Current appliance wattage (W)
 *   proposedWattage: number,      // Proposed replacement wattage (W)
 *   hoursPerDay: number,          // Average daily usage (hours)
 *   quantity: number,             // Number of units
 *   effectiveRate: number,        // ₱/kWh from latest bill
 *   upgradeCost: number,          // Total cost of upgrade (₱)
 *   applianceName?: string,       // Optional label
 * }
 *
 * Returns: ROI analysis with payback period, savings projections, etc.
 */

import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getCurrentUser } from '@/lib/auth';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ── Philippine Electricity Constants ─────────────────────────────────────────
const DAYS_PER_MONTH = 30;
const MONTHS_PER_YEAR = 12;
const DEFAULT_RATE_PER_KWH = 11.5; // Rough national average (₱/kWh)

// ── Preset Upgrade Scenarios for PH Market ──────────────────────────────────
const PRESETS = {
  ac_standard_to_inverter: {
    label: 'Standard AC → Inverter AC (1.5HP)',
    currentWattage: 1500,
    proposedWattage: 900,
    estimatedCost: 32000,
    hoursPerDay: 8,
    notes: 'High-SEER inverter units reduce compressor cycling by 40-60%.',
  },
  ref_standard_to_inverter: {
    label: 'Standard Ref → Inverter Refrigerator',
    currentWattage: 180,
    proposedWattage: 85,
    estimatedCost: 22000,
    hoursPerDay: 24,
    notes: 'Inverter compressor runs continuously at low power vs cycling on/off.',
  },
  incandescent_to_led: {
    label: '10x Incandescent Bulbs → LED',
    currentWattage: 600,   // 10 x 60W
    proposedWattage: 80,   // 10 x 8W
    estimatedCost: 2000,
    hoursPerDay: 6,
    notes: 'LED bulbs use ~87% less energy and last 25x longer.',
  },
  washer_standard_to_inverter: {
    label: 'Standard Washer → Inverter Washer',
    currentWattage: 500,
    proposedWattage: 300,
    estimatedCost: 18000,
    hoursPerDay: 1,
    notes: 'Inverter direct-drive motors are quieter and more efficient.',
  },
  electric_fan_to_dc: {
    label: 'AC Electric Fan → DC Motor Fan',
    currentWattage: 75,
    proposedWattage: 25,
    estimatedCost: 3500,
    hoursPerDay: 10,
    notes: 'DC motor fans use up to 70% less power with same airflow.',
  },
  water_heater_to_solar: {
    label: 'Electric Water Heater → Solar Hybrid',
    currentWattage: 3000,
    proposedWattage: 500,
    estimatedCost: 45000,
    hoursPerDay: 1,
    notes: 'Solar hybrid heaters use backup electric only on cloudy days.',
  },
};

// ── Core Math Engine ────────────────────────────────────────────────────────
function calculateROI({
  currentWattage,
  proposedWattage,
  hoursPerDay,
  quantity = 1,
  effectiveRate,
  upgradeCost,
}) {
  const rate = effectiveRate > 0 ? effectiveRate : DEFAULT_RATE_PER_KWH;

  // Monthly kWh consumption
  const currentMonthlyKwh  = (currentWattage * hoursPerDay * DAYS_PER_MONTH * quantity) / 1000;
  const proposedMonthlyKwh = (proposedWattage * hoursPerDay * DAYS_PER_MONTH * quantity) / 1000;
  const savingsKwhPerMonth = currentMonthlyKwh - proposedMonthlyKwh;

  // Monthly cost
  const currentMonthlyCost  = currentMonthlyKwh * rate;
  const proposedMonthlyCost = proposedMonthlyKwh * rate;
  const savingsPerMonth     = currentMonthlyCost - proposedMonthlyCost;

  // Annual
  const annualSavings    = savingsPerMonth * MONTHS_PER_YEAR;
  const annualKwhSaved   = savingsKwhPerMonth * MONTHS_PER_YEAR;

  // ROI metrics
  const paybackMonths    = savingsPerMonth > 0 ? Math.ceil(upgradeCost / savingsPerMonth) : Infinity;
  const paybackYears     = paybackMonths / MONTHS_PER_YEAR;

  // Multi-year projections
  const projections = [1, 2, 3, 5, 7, 10].map((years) => ({
    years,
    totalSaved:   Number((annualSavings * years).toFixed(0)),
    netReturn:    Number((annualSavings * years - upgradeCost).toFixed(0)),
    roi:          Number((((annualSavings * years - upgradeCost) / upgradeCost) * 100).toFixed(1)),
    kwhSaved:     Number((annualKwhSaved * years).toFixed(0)),
  }));

  // Efficiency improvement percentage
  const efficiencyGain = currentWattage > 0
    ? Number((((currentWattage - proposedWattage) / currentWattage) * 100).toFixed(1))
    : 0;

  return {
    // Current state
    currentMonthlyKwh:   Number(currentMonthlyKwh.toFixed(1)),
    currentMonthlyCost:  Number(currentMonthlyCost.toFixed(0)),

    // Proposed state
    proposedMonthlyKwh:  Number(proposedMonthlyKwh.toFixed(1)),
    proposedMonthlyCost: Number(proposedMonthlyCost.toFixed(0)),

    // Savings
    savingsKwhPerMonth:  Number(savingsKwhPerMonth.toFixed(1)),
    savingsPerMonth:     Number(savingsPerMonth.toFixed(0)),
    annualSavings:       Number(annualSavings.toFixed(0)),
    annualKwhSaved:      Number(annualKwhSaved.toFixed(0)),

    // ROI
    upgradeCost:         Number(upgradeCost),
    paybackMonths:       paybackMonths === Infinity ? null : paybackMonths,
    paybackYears:        paybackMonths === Infinity ? null : Number(paybackYears.toFixed(1)),
    efficiencyGain,

    // Rate used
    effectiveRateUsed:   Number(rate.toFixed(4)),

    // Projections
    projections,
  };
}

// ── Route Handler ───────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await import('@/lib/db');
    const client = await db.client.findUnique({ where: { id: user.sub } });
    if (client?.planTier === 'starter') {
      return NextResponse.json({ 
        error: 'FORBIDDEN', 
        message: 'Hardware ROI Simulator is a Pro feature. Please upgrade to simulate energy savings.' 
      }, { status: 403 });
    }

    const body = await request.json();
    const {
      currentWattage, proposedWattage, hoursPerDay,
      quantity, effectiveRate, upgradeCost, applianceName,
    } = body;

    // Validation
    if (!currentWattage || !proposedWattage || !hoursPerDay || !upgradeCost) {
      return NextResponse.json(
        { error: 'Missing required fields: currentWattage, proposedWattage, hoursPerDay, upgradeCost' },
        { status: 400 }
      );
    }

    if (currentWattage <= 0 || proposedWattage <= 0 || hoursPerDay <= 0 || upgradeCost <= 0) {
      return NextResponse.json(
        { error: 'All values must be positive numbers.' },
        { status: 400 }
      );
    }

    if (proposedWattage >= currentWattage) {
      return NextResponse.json(
        { error: 'Proposed wattage must be lower than current wattage for an upgrade to make sense.' },
        { status: 400 }
      );
    }

    const mathResult = calculateROI({
      currentWattage: Number(currentWattage),
      proposedWattage: Number(proposedWattage),
      hoursPerDay: Number(hoursPerDay),
      quantity: Number(quantity || 1),
      effectiveRate: Number(effectiveRate || 0),
      upgradeCost: Number(upgradeCost),
    });

    // ── AI Recommendation Step ───────────────────────────────────────────────
    const prompt = `
      You are an Energy ROI Consultant in the Philippines.
      Analyze this hardware upgrade scenario:
      Appliance: ${applianceName || 'Utility Upgrade'}
      Monthly Savings: ₱${mathResult.savingsPerMonth}
      Annual Savings: ₱${mathResult.annualSavings}
      Payback Period: ${mathResult.paybackMonths} months
      Efficiency Gain: ${mathResult.efficiencyGain}%
      
      Provide a 2-sentence expert recommendation. Is this a "No-Brainer", "Good Investment", or "Marginal Benefit"? 
      Mention if there are other factors (like maintenance or comfort) to consider.
    `;

    let recommendation = "Calculating recommendation...";
    try {
      const result = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      recommendation = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || recommendation;
    } catch (err) {
      console.error('[ROI AI Error]:', err);
    }

    return NextResponse.json({
      success: true,
      applianceName: applianceName || 'Custom Upgrade',
      analysis: {
        ...mathResult,
        recommendation
      },
    });

  } catch (error) {
    console.error('[ROI Simulator] Internal Error:', error);
    return NextResponse.json(
      { "error": "AI_LIMIT", "message": "Service busy" },
      { status: 500 }
    );
  }
}

// ── GET: Return presets ─────────────────────────────────────────────────────
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { db } = await import('@/lib/db');
  const client = await db.client.findUnique({ where: { id: user.sub } });
  if (client?.planTier === 'starter') {
    return NextResponse.json({ 
      error: 'FORBIDDEN', 
      message: 'Hardware ROI Simulator is a Pro feature. Please upgrade to unlock upgrade presets.' 
    }, { status: 403 });
  }

  return NextResponse.json({ presets: PRESETS });
}
