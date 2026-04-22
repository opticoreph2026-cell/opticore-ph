import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import * as path from 'path';

// Force local DB URL
const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

const MASTER_CATALOG = [
  // ── AIR CONDITIONERS (DOE Certified) ───────────────────────────────
  { brand: 'Carrier', modelNumber: 'WCARH009ECV', category: 'AC', wattage: 750, coolingCapacityKjH: 9500, eerRating: 12.5, estimatedPricePhp: 32000 },
  { brand: 'Carrier', modelNumber: 'WCARH012ECV', category: 'AC', wattage: 1050, coolingCapacityKjH: 12600, eerRating: 12.0, estimatedPricePhp: 38500 },
  { brand: 'Panasonic', modelNumber: 'CW-XN921JA', category: 'AC', wattage: 820, coolingCapacityKjH: 9360, eerRating: 11.4, estimatedPricePhp: 18500 },
  { brand: 'LG', modelNumber: 'LA080GC', category: 'AC', wattage: 720, coolingCapacityKjH: 8500, eerRating: 11.8, estimatedPricePhp: 24000 },
  { brand: 'Samsung', modelNumber: 'AR09TYHYEWK', category: 'AC', wattage: 780, coolingCapacityKjH: 9000, eerRating: 11.5, estimatedPricePhp: 29900 },
  { brand: 'Kolin', modelNumber: 'KAG-100REINV', category: 'AC', wattage: 900, coolingCapacityKjH: 10000, eerRating: 11.1, estimatedPricePhp: 26500 },
  
  // ── REFRIGERATORS (Standard PH) ───────────────────────────────────
  { brand: 'Panasonic', modelNumber: 'NR-BP230VS', category: 'Fridge', wattage: 85, estimatedPricePhp: 16500 },
  { brand: 'Samsung', modelNumber: 'RT22FARBDSA', category: 'Fridge', wattage: 90, estimatedPricePhp: 15800 },
  { brand: 'LG', modelNumber: 'GR-B202SQBB', category: 'Fridge', wattage: 80, estimatedPricePhp: 14200 },
  { brand: 'Condura', modelNumber: 'CSD210MN', category: 'Fridge', wattage: 110, estimatedPricePhp: 11500 },
  { brand: 'Sharp', modelNumber: 'SJ-DL55AS-SL', category: 'Fridge', wattage: 95, estimatedPricePhp: 13900 },

  // ── WATER PUMPS (Jet and Centrifugal) ─────────────────────────────
  { brand: 'Daiken', modelNumber: 'DK-125S', category: 'Pump', wattage: 125, estimatedPricePhp: 4500 },
  { brand: 'Pedrollo', modelNumber: 'PKM 60', category: 'Pump', wattage: 370, estimatedPricePhp: 7800 },
  { brand: 'Grundfos', modelNumber: 'SCALA2', category: 'Pump', wattage: 550, estimatedPricePhp: 32000 },
  
  // ── HEATERS & OTHER ───────────────────────────────────────────────
  { brand: 'Ariston', modelNumber: 'AURES SL35', category: 'Heater', wattage: 3500, estimatedPricePhp: 6500 },
  { brand: 'Panasonic', modelNumber: 'DH-3JL2P', category: 'Heater', wattage: 3500, estimatedPricePhp: 5800 },
  { brand: 'Philips', modelNumber: 'HD9218/51', category: 'Other', wattage: 1425, estimatedPricePhp: 4800 }, // Air Fryer 
  { brand: 'Imarflex', modelNumber: 'IDX-2000', category: 'Other', wattage: 2000, estimatedPricePhp: 2800 }, // Induction
];

async function main() {
  console.log(`[Seed] OptiCore PH Master Restoration Starting...`);
  
  try {
    let processed = 0;
    for (const item of MASTER_CATALOG) {
      await prisma.applianceCatalog.upsert({
        where: { modelNumber: item.modelNumber },
        update: { ...item },
        create: { ...item }
      });
      processed++;
    }
    console.log(`[Seed] Success: ${processed} high-fidelity records injected into the Registry.`);
  } catch (err) {
    console.error(`[Seed] Fatal Failure:`, err);
    process.exit(1);
  }
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
