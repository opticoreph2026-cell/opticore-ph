/**
 * OptiCore PH — Seed Data
 * Seeds: Utility Providers, ERC Rates, Water Rates, Marketplace Products
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding OptiCore PH v2 database...');

  // ── Utility Providers ────────────────────────────────────────────────────
  const providers = [
    // Electric DUs
    { code: 'MERALCO', name: 'Manila Electric Company', shortName: 'Meralco', category: 'ELECTRIC_DU', region: 'NCR', isSupported: true, bestEffortOnly: false, systemLossCap: 850, website: 'https://meralco.com.ph' },
    { code: 'MORE_POWER', name: 'MORE Electric and Power Corporation', shortName: 'MORE Power', category: 'ELECTRIC_DU', region: 'Region VI', isSupported: true, bestEffortOnly: true, systemLossCap: 850, website: 'https://www.morepower.com.ph' },
    { code: 'DLPC', name: 'Davao Light and Power Company', shortName: 'Davao Light', category: 'ELECTRIC_DU', region: 'Region XI', isSupported: true, bestEffortOnly: true, systemLossCap: 850, website: 'https://www.davaolight.com' },
    { code: 'VECO', name: 'Visayan Electric Company', shortName: 'VECO', category: 'ELECTRIC_DU', region: 'Region VII', isSupported: true, bestEffortOnly: true, systemLossCap: 850, website: 'https://www.visayanelectric.com' },
    { code: 'CEPALCO', name: 'Cagayan Electric Power and Light Company', shortName: 'CEPALCO', category: 'ELECTRIC_DU', region: 'Region X', isSupported: true, bestEffortOnly: true, systemLossCap: 850, website: 'https://www.cepalco.com.ph' },
    { code: 'AEC', name: 'Angeles Electric Corporation', shortName: 'AEC', category: 'ELECTRIC_DU', region: 'Region III', isSupported: false, bestEffortOnly: true, systemLossCap: 850 },
    { code: 'CLPC', name: 'Cotabato Light and Power Company', shortName: 'CLPC', category: 'ELECTRIC_DU', region: 'Region XII', isSupported: false, bestEffortOnly: true, systemLossCap: 850 },
    // Electric Cooperatives
    { code: 'BENECO', name: 'Benguet Electric Cooperative', shortName: 'BENECO', category: 'ELECTRIC_COOP', region: 'CAR', isSupported: true, bestEffortOnly: true, systemLossCap: 950 },
    { code: 'CEBECO_II', name: 'Cebu II Electric Cooperative', shortName: 'CEBECO II', category: 'ELECTRIC_COOP', region: 'Region VII', isSupported: false, bestEffortOnly: true, systemLossCap: 950 },
    { code: 'BOHECO_I', name: 'Bohol I Electric Cooperative', shortName: 'BOHECO I', category: 'ELECTRIC_COOP', region: 'Region VII', isSupported: false, bestEffortOnly: true, systemLossCap: 950 },
    { code: 'DANECO', name: 'Davao del Norte Electric Cooperative', shortName: 'DANECO', category: 'ELECTRIC_COOP', region: 'Region XI', isSupported: false, bestEffortOnly: true, systemLossCap: 950 },
    { code: 'NEECO_II', name: 'Nueva Ecija II Area 1 Electric Cooperative', shortName: 'NEECO II-A1', category: 'ELECTRIC_COOP', region: 'Region III', isSupported: false, bestEffortOnly: true, systemLossCap: 950 },
    // Water Utilities
    { code: 'MAYNILAD', name: 'Maynilad Water Services', shortName: 'Maynilad', category: 'WATER_CONCESSIONAIRE', region: 'NCR-West', isSupported: true, bestEffortOnly: false, systemLossCap: 0, website: 'https://www.mayniladwater.com.ph' },
    { code: 'MANILA_WATER', name: 'Manila Water Company', shortName: 'Manila Water', category: 'WATER_CONCESSIONAIRE', region: 'NCR-East', isSupported: true, bestEffortOnly: false, systemLossCap: 0, website: 'https://www.manilawater.com' },
    { code: 'MCWD', name: 'Metropolitan Cebu Water District', shortName: 'MCWD', category: 'WATER_DISTRICT', region: 'Region VII', isSupported: true, bestEffortOnly: true, systemLossCap: 0, website: 'https://www.mcwd.gov.ph' },
    { code: 'DCWD', name: 'Davao City Water District', shortName: 'DCWD', category: 'WATER_DISTRICT', region: 'Region XI', isSupported: false, bestEffortOnly: true, systemLossCap: 0, website: 'https://www.dcwd.gov.ph' },
    { code: 'PRIMEWATER', name: 'PrimeWater Infrastructure Corp.', shortName: 'PrimeWater', category: 'WATER_CONCESSIONAIRE', region: 'National', isSupported: false, bestEffortOnly: true, systemLossCap: 0 },
  ];

  for (const p of providers) {
    await prisma.utilityProvider.upsert({
      where: { code: p.code },
      update: p,
      create: p,
    });
  }
  console.log(`  ✅ ${providers.length} utility providers seeded`);

  // ── ERC Rates (sample: June 2025) ────────────────────────────────────────
  const meralco = await prisma.utilityProvider.findUnique({ where: { code: 'MERALCO' } });
  const morePower = await prisma.utilityProvider.findUnique({ where: { code: 'MORE_POWER' } });

  if (meralco) {
    await prisma.eRCRate.upsert({
      where: { duCode_effectiveMonth: { duCode: 'MERALCO', effectiveMonth: new Date('2025-06-01') } },
      update: {},
      create: {
        providerId: meralco.id,
        duCode: 'MERALCO',
        effectiveMonth: new Date('2025-06-01'),
        generationRate: 63500,      // ₱6.3500/kWh
        transmissionRate: 10800,     // ₱1.0800/kWh
        distributionRate: 17900,     // ₱1.7900/kWh
        supplyCharge: 4100,          // ₱0.4100/kWh
        meteringCharge: 3600,        // ₱0.3600/kWh
        systemLossRate: 5400,        // ₱0.5400/kWh
        universalCharges: 2600,      // ₱0.2600/kWh
        fitAllCharge: 1400,          // ₱0.1400/kWh
        franchiseTaxRate: 200,       // 2%
        vatRate: 1200,               // 12%
        lifelineThreshold: 100,      // 100 kWh
        lifelineDiscount: 4000,      // 40% discount
        ercResolutionNo: 'Sample rate — verify with ERC',
        notes: 'Sample seed data. Update monthly from ERC Consumer Portal.',
      },
    });
    console.log('  ✅ Meralco ERC rate seeded (June 2025 sample)');
  }

  if (morePower) {
    await prisma.eRCRate.upsert({
      where: { duCode_effectiveMonth: { duCode: 'MORE_POWER', effectiveMonth: new Date('2025-06-01') } },
      update: {},
      create: {
        providerId: morePower.id,
        duCode: 'MORE_POWER',
        effectiveMonth: new Date('2025-06-01'),
        generationRate: 58000,
        transmissionRate: 11200,
        distributionRate: 15500,
        supplyCharge: 3800,
        meteringCharge: 3200,
        systemLossRate: 4800,
        universalCharges: 2500,
        fitAllCharge: 1400,
        franchiseTaxRate: 200,
        vatRate: 1200,
        lifelineThreshold: 100,
        lifelineDiscount: 3500,
        ercResolutionNo: 'Sample rate — verify with ERC',
        notes: 'Sample seed data for MORE Power (Iloilo).',
      },
    });
    console.log('  ✅ MORE Power ERC rate seeded');
  }

  // ── Water Rates ──────────────────────────────────────────────────────────
  const maynilad = await prisma.utilityProvider.findUnique({ where: { code: 'MAYNILAD' } });
  const manilaWater = await prisma.utilityProvider.findUnique({ where: { code: 'MANILA_WATER' } });

  if (maynilad) {
    await prisma.waterRate.upsert({
      where: { utilityCode_effectiveDate: { utilityCode: 'MAYNILAD', effectiveDate: new Date('2025-01-01') } },
      update: {},
      create: {
        providerId: maynilad.id,
        utilityCode: 'MAYNILAD',
        effectiveDate: new Date('2025-01-01'),
        lifelineMax: 10,
        lifelineRate: 989,     // ₱9.89/cu.m
        block1Max: 20,
        block1Rate: 1784,      // ₱17.84/cu.m
        block2Max: 40,
        block2Rate: 2547,      // ₱25.47/cu.m
        block3Rate: 3892,      // ₱38.92/cu.m (above 40)
        environmentalCharge: 114, // ₱1.14/cu.m
        maintenanceCharge: 0,
        vatRate: 1200,
        nwrbResolutionNo: 'Sample — verify with MWSS-RO',
      },
    });
    console.log('  ✅ Maynilad water rate seeded');
  }

  if (manilaWater) {
    await prisma.waterRate.upsert({
      where: { utilityCode_effectiveDate: { utilityCode: 'MANILA_WATER', effectiveDate: new Date('2025-01-01') } },
      update: {},
      create: {
        providerId: manilaWater.id,
        utilityCode: 'MANILA_WATER',
        effectiveDate: new Date('2025-01-01'),
        lifelineMax: 10,
        lifelineRate: 567,     // ₱5.67/cu.m
        block1Max: 20,
        block1Rate: 1248,      // ₱12.48/cu.m
        block2Max: 40,
        block2Rate: 2893,      // ₱28.93/cu.m
        block3Rate: 4156,      // ₱41.56/cu.m
        environmentalCharge: 98,
        maintenanceCharge: 0,
        vatRate: 1200,
        nwrbResolutionNo: 'Sample — verify with MWSS-RO',
      },
    });
    console.log('  ✅ Manila Water rate seeded');
  }

  // ── Marketplace Products ─────────────────────────────────────────────────
  const products = [
    { name: 'TP-Link Kasa EP25 Smart Plug', category: 'smart_monitoring', description: 'WiFi smart plug with energy monitoring. Track real-time kWh per appliance.', priceMin: 120000, priceMax: 150000, monthlySavingsMin: 0, monthlySavingsMax: 0, lazadaUrl: 'https://www.lazada.com.ph/products/tp-link-kasa-smart-plug-i1.html', shopeeUrl: 'https://shopee.ph/tp-link-kasa-smart-plug', roiMonths: null },
    { name: 'Xiaomi Mi Smart Plug WiFi', category: 'smart_monitoring', description: 'Budget-friendly WiFi smart plug. On/off scheduling and remote control.', priceMin: 45000, priceMax: 60000, lazadaUrl: 'https://www.lazada.com.ph', shopeeUrl: 'https://shopee.ph', roiMonths: null },
    { name: 'Meiji 5-Star 0.75HP Inverter Aircon', category: 'appliances', description: 'High-efficiency inverter split-type aircon. Up to 60% less energy vs non-inverter.', priceMin: 2800000, priceMax: 3500000, monthlySavingsMin: 100000, monthlySavingsMax: 120000, roiMonths: 28 },
    { name: 'Condura Inverter Ref 7cu.ft', category: 'appliances', description: 'Inverter refrigerator with R600a eco-refrigerant. Energy Star certified.', priceMin: 2200000, priceMax: 2800000, monthlySavingsMin: 70000, monthlySavingsMax: 90000, roiMonths: 30 },
    { name: 'Firefly LED Bulb 9W (4-pack)', category: 'lighting', description: 'Replace 4 CFL/incandescent bulbs. 9W LED = 60W incandescent equivalent.', priceMin: 20000, priceMax: 35000, monthlySavingsMin: 12000, monthlySavingsMax: 20000, roiMonths: 2 },
    { name: 'Low-Flow Showerhead', category: 'water_fixtures', description: 'Reduces water flow to 7.5L/min while maintaining pressure. Saves up to 40% water.', priceMin: 50000, priceMax: 150000, monthlySavingsMin: 20000, monthlySavingsMax: 40000, roiMonths: 3 },
    { name: 'Dual-Flush Toilet Mechanism Kit', category: 'water_fixtures', description: 'Convert single-flush to dual-flush. 3L/6L options save significant water per flush.', priceMin: 80000, priceMax: 150000, monthlySavingsMin: 10000, monthlySavingsMax: 30000, roiMonths: 5 },
    { name: 'APC 1kVA Pure Sine UPS', category: 'backup_power', description: 'Clean power backup for sensitive electronics. Avoids generator fuel cost for short outages.', priceMin: 550000, priceMax: 700000, monthlySavingsMin: 0, monthlySavingsMax: 0, roiMonths: null },
    { name: 'Solar Starter Kit (1kWp)', category: 'solar', description: 'Entry-level solar panel system. Net metering eligible under ERC guidelines.', priceMin: 5000000, priceMax: 8000000, monthlySavingsMin: 150000, monthlySavingsMax: 250000, roiMonths: 36 },
  ];

  for (const p of products) {
    await prisma.marketplaceProduct.create({ data: p });
  }
  console.log(`  ✅ ${products.length} marketplace products seeded`);

  console.log('\n✨ Seed complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
