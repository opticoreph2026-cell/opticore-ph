/**
 * prisma/seed.js 
 * OptiCore PH - Deep Debug Seeding Script
 */

const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');
const process = require('process');

// ─── UTILITY PROVIDER REGISTRY (EmbeddedResource for seeding) ───────────────
const UTILITY_PROVIDERS = [
  { id: 'meralco', name: 'Manila Electric Company', shortName: 'Meralco', region: 'NCR', type: 'electricity', baseRate: 11.50, benchmarkAvg: 350 },
  { id: 'veco', name: 'Visayan Electric Company', shortName: 'VECO', region: 'Region VII', type: 'electricity', baseRate: 10.80, benchmarkAvg: 320 },
  { id: 'davao-light', name: 'Davao Light and Power Company', shortName: 'DLPC', region: 'Region XI', type: 'electricity', baseRate: 10.20, benchmarkAvg: 300 },
  { id: 'beneco', name: 'Benguet Electric Cooperative', shortName: 'BENECO', region: 'CAR', type: 'electricity', baseRate: 12.10, benchmarkAvg: 280 },
  { id: 'subic-enerzone', name: 'Subic EnerZone', shortName: 'SEZ', region: 'Region III', type: 'electricity', baseRate: 10.50, benchmarkAvg: 310 },
  { id: 'cotabato-light', name: 'Cotabato Light', shortName: 'CLPC', region: 'Region XII', type: 'electricity', baseRate: 10.90, benchmarkAvg: 290 },
  { id: 'manila-water', name: 'Manila Water Company', shortName: 'Manila Water', region: 'NCR-East', type: 'water', baseRate: 35.00, benchmarkAvg: 25 },
  { id: 'maynilad', name: 'Maynilad Water Services', shortName: 'Maynilad', region: 'NCR-West', type: 'water', baseRate: 38.50, benchmarkAvg: 28 },
  { id: 'cebu-water', name: 'Cebu Water', shortName: 'MCWD', region: 'Region VII', type: 'water', baseRate: 32.00, benchmarkAvg: 22 },
  { id: 'davao-water', name: 'Davao City Water District', shortName: 'DCWD', region: 'Region XI', type: 'water', baseRate: 30.00, benchmarkAvg: 24 },
  { id: 'leyeco-1', name: 'Leyte I Electric Cooperative', shortName: 'LEYECO I', region: 'Region VIII', type: 'electricity', baseRate: 12.50, benchmarkAvg: 250 },
  { id: 'leyeco-2', name: 'Leyte II Electric Cooperative', shortName: 'LEYECO II', region: 'Region VIII', type: 'electricity', baseRate: 12.20, benchmarkAvg: 260 },
  { id: 'leyeco-3', name: 'Leyte III Electric Cooperative', shortName: 'LEYECO III', region: 'Region VIII', type: 'electricity', baseRate: 12.80, benchmarkAvg: 240 },
  { id: 'leyeco-4', name: 'Leyte IV Electric Cooperative', shortName: 'LEYECO IV', region: 'Region VIII', type: 'electricity', baseRate: 12.40, benchmarkAvg: 245 },
  { id: 'leyeco-5', name: 'Leyte V Electric Cooperative', shortName: 'LEYECO V', region: 'Region VIII', type: 'electricity', baseRate: 12.60, benchmarkAvg: 255 },
];

const FALLBACK_APPLIANCES = [
  { brand: 'Carrier', modelNumber: 'URA-123', category: 'AC', wattage: 1200, eerRating: 11.5 },
  { brand: 'Samsung', modelNumber: 'RT38', category: 'Fridge', wattage: 150, eerRating: 4.5 },
  { brand: 'Panasonic', modelNumber: 'CW-XN920PH', category: 'AC', wattage: 900, eerRating: 12.2 },
  { brand: 'Sharp', modelNumber: 'SJ-FTS15BVS', category: 'Fridge', wattage: 120, eerRating: 5.0 },
];

// ─── ENV LOADING ─────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const dotenv = fs.readFileSync(envPath, 'utf8');
    dotenv.split('\n').forEach((line) => {
      const parts = line.split('=');
      if (parts.length >= 2 && !line.startsWith('#')) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) process.env[key] = value;
      }
    });
  }
}
loadEnv();

const rawUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

function resolveDbUrl(url) {
  if (url && url.startsWith('file:') && !url.startsWith('file:///') && !url.startsWith('file://')) {
    const filePath = url.replace(/^file:/, '');
    const absPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);
    
    // On Windows, drive letters like C:\ should be converted to file:C:/ to be safe with all driver versions
    const normalizedPath = absPath.replace(/\\/g, '/');
    return `file:${normalizedPath}`; 
  }
  return url;
}

const dbUrl = resolveDbUrl(rawUrl);
console.log(`[Seed] Initializing with DB URL: ${dbUrl}`);

// Force injection to satisfy internal Prisma checks
process.env.DATABASE_URL = dbUrl;

// In Prisma 7, we pass the config object to the PrismaLibSQL factory
const adapter = new PrismaLibSQL({ 
  url: dbUrl,
  authToken: authToken 
});
const prisma = new PrismaClient({ adapter });

const INPUT_FILE = path.join(process.cwd(), 'final_catalog.json');

async function main() {
  console.log(`[Seed] Commencing Deep Database Seed...`);

  // 1. Seed Utility Providers
  console.log(`[Seed] Syncing Utility Providers...`);
  for (const prov of UTILITY_PROVIDERS) {
    await prisma.utilityProvider.upsert({
      where: { id: prov.id },
      update: {
        baseRate: prov.baseRate,
        benchmarkAvg: prov.benchmarkAvg
      },
      create: {
        id: prov.id,
        name: prov.name,
        type: prov.type.toLowerCase(),
        region: prov.region,
        baseRate: prov.baseRate,
        benchmarkAvg: prov.benchmarkAvg
      }
    });
  }
  console.log(`[Seed] Successfully seeded ${UTILITY_PROVIDERS.length} providers.`);

  // 2. Seed Appliance Catalog
  let appliancesToSeed = [];
  if (fs.existsSync(INPUT_FILE)) {
    console.log(`[Seed] Loading appliance catalog from: ${INPUT_FILE}`);
    const rawData = fs.readFileSync(INPUT_FILE, 'utf-8');
    appliancesToSeed = JSON.parse(rawData);
  } else {
    console.warn(`[Seed] WARN: final_catalog.json not found. Using Placeholder Fallbacks.`);
    appliancesToSeed = FALLBACK_APPLIANCES;
  }

  console.log(`[Seed] Bulk inserting ${appliancesToSeed.length} catalog records...`);
  let count = 0;
  for (const app of appliancesToSeed) {
    const { pricePhp, ...fields } = app;
    await prisma.applianceCatalog.upsert({
      where: { modelNumber: fields.modelNumber },
      update: {
        wattage: fields.wattage,
        eerRating: fields.eerRating,
        estimatedPricePhp: pricePhp || fields.estimatedPricePhp
      },
      create: {
        brand: fields.brand,
        modelNumber: fields.modelNumber,
        category: fields.category || 'Other',
        wattage: fields.wattage || 0,
        eerRating: fields.eerRating || 0,
        estimatedPricePhp: pricePhp || fields.estimatedPricePhp || 0
      }
    });
    count++;
  }
  console.log(`[Seed][Success] Database initialization complete.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(`[Seed] FATAL ERROR:`, e);
    await prisma.$disconnect();
    process.exit(1);
  });
