/**
 * @file prisma/seed-energy.ts
 * @description Seed data for the OptiCore Energy platform.
 *
 * Seeded items:
 *   - EnergyOrganization × 3 (OptiCore principal + 2 partner orgs)
 *   - ProductInverter × 5 (Neovolt/Bytewatt catalog per Part B1.2)
 *   - ProductBattery × 3 (Neovolt/Bytewatt catalog per Part B1.3)
 *   - SolarPanel × 4 (Neovolt panels 450W–660W)
 *   - EnergyUtilityCompany × 5 (VECO, MERALCO, CEBECO I/II/III, DLPC)
 *   - UtilityRateSchedule × 5 (May 2026 indicative rates)
 *   - RegulatoryRule × 5 (ERC/DOE rules per Part B2)
 *
 * Prices are placeholder estimates (isPriceConfirmed: false).
 * Swap to real figures once the official Bytewatt distributor price list arrives.
 *
 * Run: npx tsx prisma/seed-energy.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  console.log('🌱 Seeding OptiCore Energy platform data...');

  // ── 1. Organizations ────────────────────────────────────────────────────────

  const opticore = await db.energyOrganization.upsert({
    where: { id: 'org-opticore-principal' },
    update: {},
    create: {
      id: 'org-opticore-principal',
      name: 'OptiCore Energy Solutions',
      type: 'principal',
      territory: JSON.stringify(['Cebu', 'Bohol', 'Leyte', 'Samar', 'Nationwide']),
      contactPerson: 'Julius Rey S. Gisto, RME',
      contactPhone: '+639XXXXXXXXX',
      contactEmail: 'julius@opticoreergy.ph',
      commissionModel: JSON.stringify({
        hardware_margin: 'variable',
        installation_fee: 'per_project',
        design_fee: 'per_project',
      }),
      status: 'active',
    },
  });

  const jericOrg = await db.energyOrganization.upsert({
    where: { id: 'org-jeric-cebu-bohol' },
    update: {},
    create: {
      id: 'org-jeric-cebu-bohol',
      name: "Engr. Jeric Inson's Installation Team",
      type: 'partner',
      territory: JSON.stringify(['Cebu', 'Bohol']),
      contactPerson: 'Engr. Jeric Inson',
      contactPhone: '+639XXXXXXXXX',
      contactEmail: 'jeric@example.ph',
      commissionModel: JSON.stringify({
        installation_fee: 'shared',
        sub_dealer_markup: 'per_unit',
      }),
      status: 'active',
    },
  });

  const sidlakOrg = await db.energyOrganization.upsert({
    where: { id: 'org-sidlakdev-leyte' },
    update: {},
    create: {
      id: 'org-sidlakdev-leyte',
      name: 'SidlakDev Leyte / Aldrean T. Polistico',
      type: 'partner',
      territory: JSON.stringify(['Leyte', 'Samar', 'Eastern Visayas']),
      contactPerson: 'Aldrean T. Polistico, ECE',
      contactPhone: '+639XXXXXXXXX',
      contactEmail: 'aldrean@sidlakdev.ph',
      commissionModel: JSON.stringify({
        sub_dealer_markup: 'per_unit',
        referral_fee: 'per_project',
      }),
      status: 'active',
    },
  });

  console.log(`  ✅ Organizations: ${opticore.name}, ${jericOrg.name}, ${sidlakOrg.name}`);

  // ── 2. Product Inverters ─────────────────────────────────────────────────────

  const inverters = [
    {
      id: 'inv-bw-sph3600',
      sku: 'BW-INV-SPH3.6K',
      modelName: 'Neovolt ESS 3.6kW Single-Phase (BW-INV-SPH3.6K)',
      family: 'single_phase_aio',
      phase: 1,
      ratedAcKw: 3.6,
      maxPvInputKw: 10.0,
      backupSurgeKw: 7.36,
      transferTimeMs: 20,
      maxParallelUnits: 6,
      peakEfficiencyPct: 97.0,
      ipRating: 'IP65',
      operatingTempMinC: -25,
      operatingTempMaxC: 60,
      certificationNotes: 'DEKRA IEC 61727:2004 & IEC 62116:2014 (valid to March 2031). ERC Type Approval: Pending.',
      // Placeholder price ~₱120,000 — UNCONFIRMED
      unitPrice: 120000,
      isPriceConfirmed: false,
      priceNote: 'Placeholder estimate ₱120,000. Pending official Bytewatt distributor price list.',
      active: true,
    },
    {
      id: 'inv-bw-sph5000',
      sku: 'BW-INV-SPH5K',
      modelName: 'Neovolt ESS 5kW Single-Phase (BW-INV-SPH5K)',
      family: 'single_phase_aio',
      phase: 1,
      ratedAcKw: 5.0,
      maxPvInputKw: 10.0,
      backupSurgeKw: 10.0,
      transferTimeMs: 20,
      maxParallelUnits: 6,
      peakEfficiencyPct: 97.3,
      ipRating: 'IP65',
      operatingTempMinC: -25,
      operatingTempMaxC: 60,
      certificationNotes: 'DEKRA IEC 61727:2004 & IEC 62116:2014 (valid to March 2031). ERC Type Approval: Pending.',
      // Placeholder price ~₱145,000 — UNCONFIRMED
      unitPrice: 145000,
      isPriceConfirmed: false,
      priceNote: 'Placeholder estimate ≈₱145,000. Pending official Bytewatt distributor price list.',
      active: true,
    },
    {
      id: 'inv-bw-tph4000',
      sku: 'BW-INV-TPH4K',
      modelName: 'Neovolt ESS 4kW Three-Phase (BW-INV-TPH4K)',
      family: 'three_phase_split',
      phase: 3,
      ratedAcKw: 4.0,
      maxPvInputKw: 8.0,
      backupSurgeKw: 8.0,
      transferTimeMs: 20,
      maxParallelUnits: 6,
      peakEfficiencyPct: 97.5,
      ipRating: 'IP65',
      operatingTempMinC: -25,
      operatingTempMaxC: 60,
      certificationNotes: 'DEKRA IEC 61727:2004 & IEC 62116:2014. ERC Type Approval: Pending.',
      unitPrice: 160000,
      isPriceConfirmed: false,
      priceNote: 'Placeholder estimate ≈₱160,000. Pending official Bytewatt distributor price list.',
      active: true,
    },
    {
      id: 'inv-bw-tph10000',
      sku: 'BW-INV-TPH10K',
      modelName: 'Neovolt ESS 10kW Three-Phase (BW-INV-TPH10K)',
      family: 'three_phase_split',
      phase: 3,
      ratedAcKw: 10.0,
      maxPvInputKw: 20.0,
      backupSurgeKw: 20.0,
      transferTimeMs: 20,
      maxParallelUnits: 6,
      peakEfficiencyPct: 98.0,
      ipRating: 'IP65',
      operatingTempMinC: -25,
      operatingTempMaxC: 60,
      certificationNotes: 'DEKRA IEC 61727:2004 & IEC 62116:2014. ERC Type Approval: Pending.',
      unitPrice: 280000,
      isPriceConfirmed: false,
      priceNote: 'Placeholder estimate ≈₱280,000. Pending official Bytewatt distributor price list.',
      active: true,
    },
    {
      id: 'inv-bw-spb5000',
      sku: 'BW-INV-SPB5K',
      modelName: 'Neovolt AC-Coupled Retrofit 5kW (BW-INV-SPB5K)',
      family: 'ac_coupled_retrofit',
      phase: 1,
      ratedAcKw: 5.0,
      maxPvInputKw: 5.0,
      backupSurgeKw: 10.0,
      transferTimeMs: 20,
      maxParallelUnits: 1,
      peakEfficiencyPct: 96.5,
      ipRating: 'IP65',
      operatingTempMinC: -25,
      operatingTempMaxC: 60,
      certificationNotes: 'For retrofit of existing grid-tied solar. ERC Type Approval: Pending.',
      unitPrice: 130000,
      isPriceConfirmed: false,
      priceNote: 'Placeholder estimate ≈₱130,000. Pending official Bytewatt distributor price list.',
      active: true,
    },
  ];

  for (const inv of inverters) {
    await db.productInverter.upsert({
      where: { id: inv.id },
      update: {},
      create: inv,
    });
  }

  console.log(`  ✅ Inverters: ${inverters.length} Neovolt models seeded`);

  // ── 3. Product Batteries ──────────────────────────────────────────────────────

  const batteries = [
    {
      id: 'bat-bw-bat101p',
      sku: 'BW-BAT-10.1P',
      modelName: 'Neovolt Battery 10.1kWh (BW-BAT-10.1P)',
      compatibleInverterFamily: 'single_phase_aio',
      nominalKwh: 10.1,
      usableKwh: 9.6,
      dodPct: 95.0,
      chemistry: 'LFP',
      cycleLife: 6000,
      warrantyYears: 10,
      warrantyThroughputMwhPerKwh: 3.0,
      roundTripEfficiencyPct: 95.0,
      dimensionsMm: '590x750x205',
      weightKg: 90.0,
      ipRating: 'IP65',
      unitPrice: 98000,
      isPriceConfirmed: false,
      priceNote: 'Placeholder estimate ≈₱98,000. Pending official Bytewatt distributor price list.',
      active: true,
    },
    {
      id: 'bat-bw-bat48s',
      sku: 'BW-BAT-4.8S',
      modelName: 'Neovolt Battery 4.8kWh (BW-BAT-4.8S)',
      compatibleInverterFamily: 'three_phase_split',
      nominalKwh: 4.8,
      usableKwh: 4.56,
      dodPct: 95.0,
      chemistry: 'LFP',
      cycleLife: 6000,
      warrantyYears: 10,
      warrantyThroughputMwhPerKwh: 3.0,
      roundTripEfficiencyPct: 95.0,
      dimensionsMm: null,
      weightKg: null,
      ipRating: 'IP65',
      unitPrice: 55000,
      isPriceConfirmed: false,
      priceNote: 'Placeholder estimate ≈₱55,000. Pending official Bytewatt distributor price list.',
      active: true,
    },
    {
      id: 'bat-bw-bat96p',
      sku: 'BW-BAT-9.6P',
      modelName: 'Neovolt Battery 9.6kWh (BW-BAT-9.6P)',
      compatibleInverterFamily: 'three_phase_split',
      nominalKwh: 9.6,
      usableKwh: 9.12,
      dodPct: 95.0,
      chemistry: 'LFP',
      cycleLife: 6000,
      warrantyYears: 10,
      warrantyThroughputMwhPerKwh: 3.0,
      roundTripEfficiencyPct: 95.0,
      dimensionsMm: null,
      weightKg: null,
      ipRating: 'IP65',
      unitPrice: 95000,
      isPriceConfirmed: false,
      priceNote: 'Placeholder estimate ≈₱95,000. Pending official Bytewatt distributor price list.',
      active: true,
    },
  ];

  for (const bat of batteries) {
    await db.productBattery.upsert({
      where: { id: bat.id },
      update: {},
      create: bat,
    });
  }

  console.log(`  ✅ Batteries: ${batteries.length} Neovolt models seeded`);

  // ── 4. Solar Panels ──────────────────────────────────────────────────────────

  const panels = [
    {
      id: 'panel-nv-450m',
      sku: 'NV-M10-450M',
      modelName: 'Neovolt Mono 450W (NV-M10-450M)',
      manufacturer: 'Neovolt',
      wattage: 450,
      efficiencyPct: 21.2,
      voc: 49.5,
      isc: 11.5,
      vmp: 41.2,
      imp: 10.9,
      dimensionsMm: '1903x1134x35',
      weightKg: 24.0,
      cellType: 'mono_perc',
      frameColor: 'black',
      warrantyYears: 25,
      performanceGuaranteePct: 85.0,
      unitPrice: 67500,
      isPriceConfirmed: false,
      active: true,
    },
    {
      id: 'panel-nv-550m',
      sku: 'NV-M10-550M',
      modelName: 'Neovolt Mono 550W (NV-M10-550M)',
      manufacturer: 'Neovolt',
      wattage: 550,
      efficiencyPct: 21.5,
      voc: 50.2,
      isc: 13.8,
      vmp: 42.1,
      imp: 13.1,
      dimensionsMm: '2278x1134x35',
      weightKg: 28.5,
      cellType: 'mono_perc',
      frameColor: 'black',
      warrantyYears: 25,
      performanceGuaranteePct: 85.0,
      unitPrice: 82500,
      isPriceConfirmed: false,
      active: true,
    },
    {
      id: 'panel-nv-600b',
      sku: 'NV-BB-600B',
      modelName: 'Neovolt Bifacial 600W (NV-BB-600B)',
      manufacturer: 'Neovolt',
      wattage: 600,
      efficiencyPct: 22.1,
      voc: 52.8,
      isc: 14.3,
      vmp: 44.2,
      imp: 13.6,
      dimensionsMm: '2384x1134x35',
      weightKg: 32.0,
      cellType: 'bifacial',
      frameColor: 'black',
      warrantyYears: 30,
      performanceGuaranteePct: 87.0,
      unitPrice: 105000,
      isPriceConfirmed: false,
      active: true,
    },
    {
      id: 'panel-nv-660m',
      sku: 'NV-M10-660M',
      modelName: 'Neovolt Mono 660W (NV-M10-660M)',
      manufacturer: 'Neovolt',
      wattage: 660,
      efficiencyPct: 21.8,
      voc: 54.1,
      isc: 15.2,
      vmp: 45.6,
      imp: 14.5,
      dimensionsMm: '2440x1134x35',
      weightKg: 33.5,
      cellType: 'mono_perc',
      frameColor: 'silver',
      warrantyYears: 25,
      performanceGuaranteePct: 85.0,
      unitPrice: 112500,
      isPriceConfirmed: false,
      active: true,
    },
  ];

  for (const pnl of panels) {
    await db.solarPanel.upsert({
      where: { id: pnl.id },
      update: {},
      create: pnl,
    });
  }

  console.log(`  ✅ Solar Panels: ${panels.length} Neovolt models seeded`);

  // ── 5. Utility Companies ─────────────────────────────────────────────────────

  const utilities = [
    {
      id: 'util-veco',
      code: 'VECO',
      name: 'Visayas Electric Company',
      territory: 'Cebu City and surroundings',
      netMeteringApplicationUrl: 'https://veco.com.ph/net-metering',
      defaultProcessingDays: 60,
      dimcFeeCap: 3000,
    },
    {
      id: 'util-meralco',
      code: 'MERALCO',
      name: 'Manila Electric Company',
      territory: 'Metro Manila and neighboring provinces',
      netMeteringApplicationUrl: 'https://www.meralco.com.ph/net-metering',
      defaultProcessingDays: 60,
      dimcFeeCap: 3000,
    },
    {
      id: 'util-cebeco1',
      code: 'CEBECO_I',
      name: 'Cebu Electric Cooperative I',
      territory: 'Northern Cebu',
      netMeteringApplicationUrl: null,
      defaultProcessingDays: 90,
      dimcFeeCap: 3000,
    },
    {
      id: 'util-cebeco2',
      code: 'CEBECO_II',
      name: 'Cebu Electric Cooperative II',
      territory: 'Central Cebu (outside Cebu City)',
      netMeteringApplicationUrl: null,
      defaultProcessingDays: 90,
      dimcFeeCap: 3000,
    },
    {
      id: 'util-dlpc',
      code: 'DLPC',
      name: 'Davao Light and Power Company / LEYTE Electric Cooperative',
      territory: 'Eastern Visayas (Leyte, Samar)',
      netMeteringApplicationUrl: null,
      defaultProcessingDays: 90,
      dimcFeeCap: 3000,
    },
  ];

  for (const util of utilities) {
    await db.energyUtilityCompany.upsert({
      where: { id: util.id },
      update: {},
      create: util,
    });
  }

  console.log(`  ✅ Utility companies: ${utilities.length} seeded`);

  // ── 5. Utility Rate Schedules (May 2026 indicative — versioned) ──────────────

  const effectiveMay2026 = new Date('2026-05-01T00:00:00.000Z');
  const rateSchedules = [
    {
      id: 'rate-veco-res-may2026',
      utilityCompanyId: 'util-veco',
      customerClass: 'residential',
      effectiveDate: effectiveMay2026,
      // VECO residential ≈ ₱12.88/kWh all-in (May 2026) → × 10,000 = 128800
      allInRateRu: 128800,
      // VECO BGC ≈ ₱5.00/kWh → × 10,000 = 50000
      blendedGenerationRateRu: 50000,
      transmissionRateRu: 16000,
      distributionRateRu: 22000,
      notes: 'Indicative May 2026 rates. Verify against latest VECO billing statement.',
      sourceUrl: 'https://veco.com.ph',
    },
    {
      id: 'rate-veco-com-may2026',
      utilityCompanyId: 'util-veco',
      customerClass: 'commercial',
      effectiveDate: effectiveMay2026,
      allInRateRu: 131000,
      blendedGenerationRateRu: 52000,
      transmissionRateRu: 16000,
      distributionRateRu: 24000,
      notes: 'Indicative May 2026 commercial rates. Verify against latest VECO billing statement.',
      sourceUrl: 'https://veco.com.ph',
    },
    {
      id: 'rate-meralco-res-may2026',
      utilityCompanyId: 'util-meralco',
      customerClass: 'residential',
      effectiveDate: effectiveMay2026,
      // Meralco ≈ ₱13.00/kWh residential → 130000 RU
      allInRateRu: 130000,
      // Meralco BGC ≈ ₱6.50/kWh → 65000 RU
      blendedGenerationRateRu: 65000,
      transmissionRateRu: 14000,
      distributionRateRu: 18000,
      notes: 'Indicative May 2026 Meralco residential. For Metro Manila reference projects.',
      sourceUrl: 'https://www.meralco.com.ph',
    },
    {
      id: 'rate-cebeco1-res-may2026',
      utilityCompanyId: 'util-cebeco1',
      customerClass: 'residential',
      effectiveDate: effectiveMay2026,
      // CEBECO ≈ ₱13.37/kWh → 133700 RU
      allInRateRu: 133700,
      blendedGenerationRateRu: 50000,
      transmissionRateRu: 16000,
      distributionRateRu: 25000,
      notes: 'Indicative May 2026 CEBECO I residential.',
      sourceUrl: null,
    },
    {
      id: 'rate-dlpc-res-may2026',
      utilityCompanyId: 'util-dlpc',
      customerClass: 'residential',
      effectiveDate: effectiveMay2026,
      // Eastern Visayas — higher rates due to weak grid dependency
      allInRateRu: 135000,
      blendedGenerationRateRu: 50000,
      transmissionRateRu: 18000,
      distributionRateRu: 26000,
      notes: 'Indicative May 2026 Eastern Visayas rates. Verify locally — frequent adjustments.',
      sourceUrl: null,
    },
  ];

  for (const schedule of rateSchedules) {
    await db.utilityRateSchedule.upsert({
      where: { id: schedule.id },
      update: {},
      create: schedule,
    });
  }

  console.log(`  ✅ Rate schedules: ${rateSchedules.length} seeded`);

  // ── 6. Regulatory Rules ──────────────────────────────────────────────────────

  const rulesEffective2026 = new Date('2026-04-01T00:00:00.000Z');
  const rules = [
    {
      id: 'rule-nm-cap-residential',
      ruleKey: 'net_metering_cap_kw_residential',
      value: '100',
      effectiveDate: rulesEffective2026,
      sourceReference: 'RA 9513, ERC Resolution No. 09 Series of 2013',
      notes: 'Residential customers: effectively capped near 100 kW in practice.',
    },
    {
      id: 'rule-nm-cap-commercial',
      ruleKey: 'net_metering_cap_kw_commercial',
      value: '1000',
      effectiveDate: rulesEffective2026,
      sourceReference: 'April 2026 DOE Circular — 100 kW cap removed for commercial/industrial',
      notes: 'Commercial/industrial: new cap = contracted capacity or 1 MW, whichever is lower.',
    },
    {
      id: 'rule-dimc-fee-cap',
      ruleKey: 'dimc_fee_cap_php',
      value: '3000',
      effectiveDate: new Date('2025-09-22T00:00:00.000Z'),
      sourceReference: 'ERC Advisory September 22, 2025',
      notes: 'Difference-in-Meter-Cost fee capped at ₱3,000 for residential consumers.',
    },
    {
      id: 'rule-credit-rollover',
      ruleKey: 'credit_rollover_allowed',
      value: 'true',
      effectiveDate: rulesEffective2026,
      sourceReference: 'ERC 2025–2026 Net Metering Amendments',
      notes: 'Net metering credits may be banked and rolled over to future bills.',
    },
    {
      id: 'rule-application-response-days',
      ruleKey: 'application_response_days',
      value: '10',
      effectiveDate: rulesEffective2026,
      sourceReference: 'April 2026 DOE Mandate',
      notes: 'DU must respond within 10 working days of a complete net metering application.',
    },
  ];

  for (const rule of rules) {
    await db.regulatoryRule.upsert({
      where: { id: rule.id },
      update: {},
      create: rule,
    });
  }

  console.log(`  ✅ Regulatory rules: ${rules.length} seeded`);

  // ── 7. Users (Admin + Partners) ──────────────────────────────────────────────

  await seedUsers();

  console.log('');
  console.log('✨ OptiCore Energy seed complete!');
  console.log('');
  console.log('⚠️  REMINDER: Product prices are placeholder estimates (isPriceConfirmed: false).');
  console.log('   Update via Admin → Energy → Product Catalog once the official Bytewatt');
  console.log('   distributor price list is received.');
}

async function seedUsers() {
  const defaultPassword = await bcrypt.hash('OptiCore-ES2026', 12);
  const passwordHash = `bcrypt:${defaultPassword}`;

  // Julius — Owner/Admin
  const juliusClient = await db.client.upsert({
    where: { email: 'julius@opticore.ph' },
    update: {},
    create: {
      email: 'julius@opticore.ph',
      name: 'Julius Rey S. Gisto',
      passwordHash,
      role: 'opticore_owner',
      emailVerified: new Date(),
      onboardingComplete: true,
      preferredLanguage: 'taglish',
    },
  });

  await db.energyProfile.upsert({
    where: { clientId: juliusClient.id },
    update: {},
    create: {
      clientId: juliusClient.id,
      fullName: 'Julius Rey S. Gisto',
      role: 'opticore_owner',
      organizationId: 'org-opticore-principal',
      prcLicenseNo: 'RME-XXXXXXXX',
      prcLicenseType: 'RME',
      phone: '+639171234567',
    },
  });

  // Jeric — Installation Partner (Cebu/Bohol)
  const jericClient = await db.client.upsert({
    where: { email: 'jeric@onsite-install.com' },
    update: {},
    create: {
      email: 'jeric@onsite-install.com',
      name: 'Engr. Jeric Inson',
      passwordHash,
      role: 'partner_admin',
      emailVerified: new Date(),
      onboardingComplete: true,
    },
  });

  await db.energyProfile.upsert({
    where: { clientId: jericClient.id },
    update: {},
    create: {
      clientId: jericClient.id,
      fullName: 'Engr. Jeric Inson',
      role: 'partner_admin',
      organizationId: 'org-jeric-cebu-bohol',
      phone: '+639171234568',
    },
  });

  // Aldrean — Sub-Dealer (Leyte)
  const aldreanClient = await db.client.upsert({
    where: { email: 'aldrean@siddlak.com' },
    update: {},
    create: {
      email: 'aldrean@siddlak.com',
      name: 'Aldrean T. Polistico',
      passwordHash,
      role: 'partner_admin',
      emailVerified: new Date(),
      onboardingComplete: true,
    },
  });

  await db.energyProfile.upsert({
    where: { clientId: aldreanClient.id },
    update: {},
    create: {
      clientId: aldreanClient.id,
      fullName: 'Aldrean T. Polistico',
      role: 'partner_admin',
      organizationId: 'org-sidlakdev-leyte',
      prcLicenseNo: 'ECE-XXXXXXXX',
      prcLicenseType: 'ECE',
      phone: '+639171234569',
    },
  });

  console.log('  ✅ Users seeded: Julius (opticore_owner), Jeric (partner_admin), Aldrean (partner_admin)');

  // ── 12. FAQ Entries ─────────────────────────────────────────────────────────

  const faqData = [
    { question: 'How much does a solar system cost?', answer: 'A typical residential solar + battery system in the Philippines ranges from ₱250,000 to ₱850,000 depending on your monthly consumption, backup requirements, and roof type. Use our ROI calculator for a personalized estimate, or book a free site assessment for an exact quotation.', locale: 'en', category: 'pricing', sortOrder: 1 },
    { question: 'Do I need a net metering permit?', answer: 'Our hybrid inverters support zero-export mode, which means you can install without a net metering permit. The system powers your loads during the day and charges batteries — excess solar is simply throttled. If you want to sell power back to the grid, we can help with the net metering application process.', locale: 'en', category: 'installation', sortOrder: 2 },
    { question: 'How long does installation take?', answer: 'A standard residential installation takes 1–3 days. This includes mounting panels, installing the inverter and batteries, running conduit, and commissioning. Commercial projects typically take 3–7 days depending on system size and complexity.', locale: 'en', category: 'installation', sortOrder: 3 },
    { question: 'What areas do you serve?', answer: 'We serve Cebu, Bohol, and Leyte provinces — including Cebu City, Mandaue, Lapu-Lapu, Talisay, Danao, Tagbilaran, Ormoc, and Tacloban. For areas outside these provinces, we offer remote design consultations.', locale: 'en', category: 'general', sortOrder: 4 },
    { question: 'What warranty do your systems come with?', answer: 'Neovolt inverters come with a 5-year warranty, and LFP batteries carry a 10-year warranty. Solar panels are warranted for 25 years (linear performance). All installations by OptiCore include a 1-year workmanship warranty.', locale: 'en', category: 'pricing', sortOrder: 5 },
    { question: 'Magkano ang solar system?', answer: 'Ang presyo ng residential solar + battery system ay karaniwang ₱250,000 hanggang ₱850,000 depende sa inyong monthly consumption, backup requirements, at roof type. Gamitin ang aming ROI calculator para sa personal na tantiya, o mag-book ng libreng site assessment para sa eksaktong quotation.', locale: 'fil', category: 'pricing', sortOrder: 1 },
    { question: 'Gaano katagal ang installation?', answer: 'Ang karaniwang residential installation ay tumatagal ng 1–3 araw. Kasama rito ang pag-mount ng panels, pag-install ng inverter at batteries, pag-conduct ng conduit, at commissioning. Ang commercial projects ay karaniwang 3–7 araw depende sa system size.', locale: 'fil', category: 'installation', sortOrder: 2 },
    { question: 'Anong lugar ang inyong sineserbisyuhan?', answer: 'Kami ay nagse-serve sa Cebu, Bohol, at Leyte provinces — kabilang ang Cebu City, Mandaue, Lapu-Lapu, Talisay, Danao, Tagbilaran, Ormoc, at Tacloban. Para sa mga lugar sa labas ng mga probinsyang ito, nag-aalok kami ng remote design consultations.', locale: 'fil', category: 'general', sortOrder: 3 },
  ];

  for (const faq of faqData) {
    await db.faqEntry.create({ data: faq });
  }

  console.log('  ✅ FAQ entries seeded: 8 (5 EN + 3 FIL)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
