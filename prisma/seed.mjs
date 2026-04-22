import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import * as process from 'process';
import path from 'path';

let rawUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db';
const authToken = process.env.TURSO_AUTH_TOKEN?.replace(/['"]/g, '');

// Strip surrounding quotes
const cleanUrl = rawUrl.replace(/['"]/g, '').split('?')[0];

function resolveDbUrl(url) {
  if (url && url.startsWith('file:') && !url.startsWith('file:///') && !url.startsWith('file://')) {
    const filePath = url.replace(/^file:/, '');
    const absPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);
    const normalizedPath = absPath.replace(/\\/g, '/');
    return `file:${normalizedPath}`; 
  }
  return url;
}

const resolvedUrl = resolveDbUrl(cleanUrl);
console.log(`[Seed] Initializing with DB URL: ${resolvedUrl}`);

const adapter = new PrismaLibSql({ url: resolvedUrl });
const prisma = new PrismaClient({ adapter });

const UTILITY_PROVIDERS = [
  { id: 'meralco', name: 'Manila Electric Company', region: 'NCR', type: 'ELECTRIC', baseRate: 11.50, benchmarkAvg: 350 },
  { id: 'veco', name: 'Visayan Electric Company', region: 'Region VII', type: 'ELECTRIC', baseRate: 10.80, benchmarkAvg: 320 },
  { id: 'davao-light', name: 'Davao Light and Power Company', region: 'Region XI', type: 'ELECTRIC', baseRate: 10.20, benchmarkAvg: 300 },
  { id: 'beneco', name: 'Benguet Electric Cooperative', region: 'CAR', type: 'ELECTRIC', baseRate: 12.10, benchmarkAvg: 280 },
  { id: 'manila-water', name: 'Manila Water Company', region: 'NCR-East', type: 'WATER', baseRate: 35.00, benchmarkAvg: 25 },
  { id: 'maynilad', name: 'Maynilad Water Services', region: 'NCR-West', type: 'WATER', baseRate: 38.50, benchmarkAvg: 28 },
];

const APPLIANCE_CATALOG_DATA = [
  // ── AIR CONDITIONERS (AC) ──────────────────────────────────────────
  {
    brand: "Carrier",
    modelNumber: "WCARH009ECV", // Crystal Inverter 1.0HP
    category: "AC",
    wattage: 820,
    coolingCapacityKjH: 9500,
    eerRating: 11.6,
  },
  {
    brand: "Carrier",
    modelNumber: "WCARH012ECV", // Crystal Inverter 1.5HP
    category: "AC",
    wattage: 1100,
    coolingCapacityKjH: 12650,
    eerRating: 11.5,
  },
  {
    brand: "Carrier",
    modelNumber: "WCARZ019ECV", // Crystal Inverter 2.0HP
    category: "AC",
    wattage: 1650,
    coolingCapacityKjH: 19500,
    eerRating: 11.8,
  },
  {
    brand: "Condura",
    modelNumber: "WCONW009EC", // Prima (Non-Inverter) 1.0HP
    category: "AC",
    wattage: 955,
    coolingCapacityKjH: 9400,
    eerRating: 9.8,
  },
  {
    brand: "Condura",
    modelNumber: "WCONW012EC", // Prima (Non-Inverter) 1.5HP
    category: "AC",
    wattage: 1250,
    coolingCapacityKjH: 12000,
    eerRating: 9.6,
  },
  {
    brand: "Panasonic",
    modelNumber: "CS-PU9WKQ", // Premium Inverter 1.0HP
    category: "AC",
    wattage: 730,
    coolingCapacityKjH: 9360,
    eerRating: 12.8,
  },
  {
    brand: "Panasonic",
    modelNumber: "CS-PU12WKQ", // Premium Inverter 1.5HP
    category: "AC",
    wattage: 1040,
    coolingCapacityKjH: 12500,
    eerRating: 12.0,
  },
  {
    brand: "LG",
    modelNumber: "LA100GC", // Dual Inverter White 1.0HP
    category: "AC",
    wattage: 810,
    coolingCapacityKjH: 9500,
    eerRating: 11.7,
  },
  {
    brand: "LG",
    modelNumber: "LA150GC", // Dual Inverter White 1.5HP
    category: "AC",
    wattage: 1210,
    coolingCapacityKjH: 13500,
    eerRating: 11.2,
  },
  {
    brand: "LG",
    modelNumber: "LA200GC", // Dual Inverter 2.0HP
    category: "AC",
    wattage: 1620,
    coolingCapacityKjH: 19000,
    eerRating: 11.7,
  },
  {
    brand: "Panasonic",
    modelNumber: "CW-XN1221EPH", // Non-Inverter 1.5HP
    category: "AC",
    wattage: 1220,
    coolingCapacityKjH: 12000,
    eerRating: 9.8,
  },

  // ── REFRIGERATORS (Fridge) ──────────────────────────────────────────
  {
    brand: "Samsung",
    modelNumber: "RT25M4033UT", // Digital Inverter 9.1 cu.ft
    category: "Fridge",
    wattage: 110,
    coolingCapacityKjH: 0,
    eerRating: 420,
  },
  {
    brand: "Samsung",
    modelNumber: "RT32K5032S8", // Inverter 11.4 cu.ft
    category: "Fridge",
    wattage: 130,
    coolingCapacityKjH: 0,
    eerRating: 410,
  },
  {
    brand: "Sharp",
    modelNumber: "SJ-FTB08AVS-SL", // J-Tech Inverter 8.0 cu.ft
    category: "Fridge",
    wattage: 85,
    coolingCapacityKjH: 0,
    eerRating: 385,
  },
  {
    brand: "Sharp",
    modelNumber: "SJ-FLG16AVP-BK", // 4-Door Inverter 16.7 cu.ft
    category: "Fridge",
    wattage: 180,
    coolingCapacityKjH: 0,
    eerRating: 360,
  },
  {
    brand: "Panasonic",
    modelNumber: "NR-BP230VS", // Inverter 2-Door 8.2 cu.ft
    category: "Fridge",
    wattage: 75,
    coolingCapacityKjH: 0,
    eerRating: 442,
  },
  {
    brand: "Panasonic",
    modelNumber: "NR-BW410GKPH", // Bottom Freezer Inverter 14.4 cu.ft
    category: "Fridge",
    wattage: 145,
    coolingCapacityKjH: 0,
    eerRating: 415,
  },

  // ── WATER PUMPS (Pump) ──────────────────────────────────────────────
  {
    brand: "Grundfos",
    modelNumber: "SCALA2", // Intelligent Water Booster
    category: "Pump",
    wattage: 550,
    coolingCapacityKjH: 0,
    eerRating: 0,
  },
  {
    brand: "Grundfos",
    modelNumber: "JP5-48", // Jet Pump 1.0HP
    category: "Pump",
    wattage: 750,
    coolingCapacityKjH: 0,
    eerRating: 0,
  },
  {
    brand: "Shimge",
    modelNumber: "PW370", // Automatic Self-Priming 0.5HP
    category: "Pump",
    wattage: 370,
    coolingCapacityKjH: 0,
    eerRating: 0,
  },
  {
    brand: "Shimge",
    modelNumber: "SGJW75", // Jet Pump 1.0HP
    category: "Pump",
    wattage: 750,
    coolingCapacityKjH: 0,
    eerRating: 0,
  },
  {
    brand: "Shimge",
    modelNumber: "SGJW110", // Jet Pump 1.5HP
    category: "Pump",
    wattage: 1100,
    coolingCapacityKjH: 0,
    eerRating: 0,
  }
];

async function main() {
  console.log('[Seed] Starting Philippine Master Seed...');
  
  // Debug: List available models
  const models = Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_'));
  console.log('[Seed] Available models in Prisma Client:', models);

  if (!prisma.applianceCatalog) {
    console.error('[Seed] CRITICAL: prisma.applianceCatalog is undefined!');
    return;
  }

  // 1. Seed Utility Providers
  console.log('[Seed] Syncing Utility Providers...');
  for (const prov of UTILITY_PROVIDERS) {
    try {
      await prisma.utilityProvider.upsert({
        where: { id: prov.id },
        update: {
          name: prov.name,
          baseRate: prov.baseRate,
          benchmarkAvg: prov.benchmarkAvg,
          region: prov.region
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
      console.log(`[Seed] Synced Provider: ${prov.name}`);
    } catch (err) {
      console.error(`[Seed] Error syncing provider ${prov.id}:`, err.message);
    }
  }

  // 2. Seed Appliance Catalog
  console.log('[Seed] Syncing Appliance Catalog...');

  for (const entry of APPLIANCE_CATALOG_DATA) {
    try {
      await prisma.applianceCatalog.upsert({
        where: { modelNumber: entry.modelNumber },
        update: {
          brand: entry.brand,
          category: entry.category,
          wattage: entry.wattage,
          coolingCapacityKjH: entry.coolingCapacityKjH,
          eerRating: entry.eerRating
        },
        create: entry,
      });
      console.log(`[Seed] Synced: ${entry.brand} ${entry.modelNumber}`);
    } catch (err) {
      console.error(`[Seed] Error syncing ${entry.modelNumber}:`, err.message);
    }
  }

  console.log(`[Seed] Success: Populated ${APPLIANCE_CATALOG_DATA.length} models into the Engineering Catalog.`);
}

main()
  .catch((e) => {
    console.error('[Seed] Critical Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
