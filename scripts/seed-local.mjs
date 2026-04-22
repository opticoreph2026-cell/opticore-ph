/**
 * seed-local.mjs
 * Seeds UtilityProvider rows directly into dev.db via native SQLite.
 * Run with: node scripts/seed-local.mjs
 */
import { createRequire } from 'module';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

const Database = require('better-sqlite3');

const dbPath = join(__dirname, '..', 'dev.db');
const db = new Database(dbPath);

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

const insert = db.prepare(`
  INSERT OR IGNORE INTO UtilityProvider (id, name, type, region, baseRate, benchmarkAvg, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
`);

const count = db.prepare('SELECT COUNT(*) as c FROM UtilityProvider').get();
console.log(`Current provider count: ${count.c}`);

let added = 0;
for (const p of PROVIDERS) {
  const result = insert.run(randomUUID(), p.name, p.type, p.region, p.baseRate, p.benchmarkAvg);
  if (result.changes > 0) { console.log(`  ✓ Added: ${p.name}`); added++; }
  else { console.log(`  – Exists: ${p.name}`); }
}

const countAfter = db.prepare('SELECT COUNT(*) as c FROM UtilityProvider').get();
console.log(`\nDone. Added ${added} new providers. Total: ${countAfter.c}`);
db.close();
