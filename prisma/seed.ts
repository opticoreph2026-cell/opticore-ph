/**
 * OptiCore PH — Provider Seed Data
 *
 * Run: npx tsx prisma/seed.ts
 * Or via: npx prisma db seed
 *
 * Seeding strategy: upsert by `code` — safe to run multiple times.
 * Rate values in rate units (₱/kWh × 10,000).
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

function makeClient(): PrismaClient {
  const url = (process.env.TURSO_DATABASE_URL || '').trim();
  const token = (process.env.TURSO_AUTH_TOKEN || '').trim();

  if (url && (url.startsWith('libsql://') || url.startsWith('https://'))) {
    const libsql = createClient({ url, authToken: token || undefined });
    const adapter = new PrismaLibSQL(libsql);
    process.env.DATABASE_URL = 'file:./dev.db';
    return new PrismaClient({ adapter });
  }

  if (!process.env.DATABASE_URL) process.env.DATABASE_URL = 'file:./dev.db';
  return new PrismaClient();
}

const db = makeClient();

const providers = [
  // ── OFFICIALLY SUPPORTED (isSupported: true, bestEffortOnly: false) ──────
  {
    code:          'MERALCO',
    name:          'Manila Electric Company (Meralco)',
    type:          'PRIVATE_DU' as const,
    region:        'NCR, Rizal, Bulacan, Cavite, Laguna',
    isSupported:   true,
    bestEffortOnly: false,
    parserVersion: 'v2',
    // ₱11.4250/kWh average residential rate (as of 2025 Q1)
    baseRate:      114250,
    benchmarkAvg:  114250,
    logoUrl:       null,
    website:       'https://www.meralco.com.ph',
  },

  // ── BETA SUPPORT (isSupported: true, bestEffortOnly: true) ───────────────
  {
    code:          'VECO',
    name:          'Visayan Electric Company (VECO)',
    type:          'PRIVATE_DU' as const,
    region:        'Region VII — Metro Cebu',
    isSupported:   true,
    bestEffortOnly: true,
    parserVersion: 'v1',
    // ~₱12.50/kWh estimated
    baseRate:      125000,
    benchmarkAvg:  125000,
    logoUrl:       null,
    website:       'https://www.visayanelectric.com',
  },
  {
    code:          'DAVAOLIGHT',
    name:          'Davao Light and Power Company',
    type:          'PRIVATE_DU' as const,
    region:        'Region XI — Davao del Sur',
    isSupported:   true,
    bestEffortOnly: true,
    parserVersion: 'v1',
    // ~₱11.80/kWh estimated
    baseRate:      118000,
    benchmarkAvg:  118000,
    logoUrl:       null,
    website:       'https://www.davaolightpower.com',
  },

  // ── PIPELINE (isSupported: false) ─────────────────────────────────────────
  {
    code:          'CEPALCO',
    name:          'Cagayan Electric Power and Light Company (CEPALCO)',
    type:          'PRIVATE_DU' as const,
    region:        'Region X — Cagayan de Oro',
    isSupported:   false,
    bestEffortOnly: true,
    parserVersion: 'v1',
    baseRate:      0,
    benchmarkAvg:  0,
    logoUrl:       null,
    website:       'https://www.cepalco.com',
  },
  {
    code:          'MOREPOWER',
    name:          'MORE Electric and Power Corporation',
    type:          'PRIVATE_DU' as const,
    region:        'Region VI — Iloilo City',
    isSupported:   false,
    bestEffortOnly: true,
    parserVersion: 'v1',
    baseRate:      0,
    benchmarkAvg:  0,
    logoUrl:       null,
    website:       null,
  },
  {
    code:          'BENECO',
    name:          'Benguet Electric Cooperative (BENECO)',
    type:          'COOPERATIVE' as const,
    region:        'CAR — Benguet',
    isSupported:   false,
    bestEffortOnly: true,
    parserVersion: 'v1',
    baseRate:      0,
    benchmarkAvg:  0,
    logoUrl:       null,
    website:       null,
  },
  {
    code:          'BATELEC1',
    name:          'Batangas I Electric Cooperative (BATELEC I)',
    type:          'COOPERATIVE' as const,
    region:        'Region IV-A — Batangas',
    isSupported:   false,
    bestEffortOnly: true,
    parserVersion: 'v1',
    baseRate:      0,
    benchmarkAvg:  0,
    logoUrl:       null,
    website:       null,
  },
  {
    code:          'FLECO',
    name:          'Frontier Logistics and Electric Cooperative (FLECO)',
    type:          'COOPERATIVE' as const,
    region:        'Region VII — Cebu',
    isSupported:   false,
    bestEffortOnly: true,
    parserVersion: 'v1',
    baseRate:      0,
    benchmarkAvg:  0,
    logoUrl:       null,
    website:       null,
  },
];

async function main() {
  console.log('🌱 Seeding utility providers...');

  for (const provider of providers) {
    await db.utilityProvider.upsert({
      where:  { code: provider.code },
      update: provider,
      create: provider,
    });
    const tag = provider.isSupported
      ? (provider.bestEffortOnly ? '🟡 Beta' : '🟢 Supported')
      : '⚪ Pipeline';
    console.log(`  ${tag} ${provider.name} (${provider.code})`);
  }

  const total = await db.utilityProvider.count();
  console.log(`\n✅ Done. ${total} providers in database.`);
  await db.$disconnect();
}

main().catch(async (err) => {
  console.error('Seed error:', err);
  await db.$disconnect();
  process.exit(1);
});
