/**
 * seed-providers-local.ts
 * Seeds UtilityProvider rows into the local dev.db.
 * Uses @libsql/client directly with file:// URL (works fine for one-shot writes).
 * Run with: npx tsx scripts/seed-providers-local.ts
 */
import { createClient } from '@libsql/client';
import { join } from 'path';
import { randomUUID } from 'crypto';

const dbPath = join(process.cwd(), 'dev.db');
const db = createClient({ url: `file:${dbPath}` });

const PROVIDERS = [
  { name: 'Meralco',                    type: 'electricity', region: 'Metro Manila',      baseRate: 11.50, benchmarkAvg: 250 },
  { name: 'VECO (Visayan Electric)',     type: 'electricity', region: 'Cebu City',         baseRate: 10.95, benchmarkAvg: 220 },
  { name: 'Davao Light (DLPC)',          type: 'electricity', region: 'Davao City',        baseRate: 10.40, benchmarkAvg: 220 },
  { name: 'CEBECO',                      type: 'electricity', region: 'Cebu Province',     baseRate: 11.10, benchmarkAvg: 200 },
  { name: 'BENECO',                      type: 'electricity', region: 'Benguet',           baseRate: 9.80,  benchmarkAvg: 180 },
  { name: 'MORE Power',                  type: 'electricity', region: 'Iloilo City',       baseRate: 10.10, benchmarkAvg: 200 },
  { name: 'BATELEC I',                   type: 'electricity', region: 'Batangas',          baseRate: 10.20, benchmarkAvg: 190 },
  { name: 'Other Electricity Provider', type: 'electricity', region: 'Nationwide',        baseRate: 11.00, benchmarkAvg: 200 },
  { name: 'Manila Water',               type: 'water',       region: 'Metro Manila East', baseRate: 30.50, benchmarkAvg: 15  },
  { name: 'Maynilad',                   type: 'water',       region: 'Metro Manila West', baseRate: 28.90, benchmarkAvg: 15  },
  { name: 'MCWD',                       type: 'water',       region: 'Metro Cebu',        baseRate: 27.50, benchmarkAvg: 14  },
  { name: 'DCWD',                       type: 'water',       region: 'Davao City',        baseRate: 25.00, benchmarkAvg: 13  },
  { name: 'Other Water District',       type: 'water',       region: 'Nationwide',        baseRate: 25.00, benchmarkAvg: 12  },
];

async function main() {
  // Check current count
  const { rows } = await db.execute('SELECT COUNT(*) as c FROM UtilityProvider');
  console.log(`Current provider count: ${rows[0].c}`);

  let added = 0;
  for (const p of PROVIDERS) {
    try {
      await db.execute({
        sql: `INSERT OR IGNORE INTO UtilityProvider
              (id, name, type, region, baseRate, benchmarkAvg, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        args: [randomUUID(), p.name, p.type, p.region, p.baseRate, p.benchmarkAvg],
      });
      console.log(`  ✓ ${p.name}`);
      added++;
    } catch (e: any) {
      console.log(`  – Skip (exists): ${p.name} — ${e.message}`);
    }
  }

  const after = await db.execute('SELECT COUNT(*) as c FROM UtilityProvider');
  console.log(`\nDone. Attempted ${added}. Total providers: ${after.rows[0].c}`);
}

main().catch(console.error);
