const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

const STATIC_PROVIDERS = [
  { name: 'Meralco', type: 'electricity', region: 'Metro Manila', baseRate: 11.50, benchmarkAvg: 250 },
  { name: 'VECO (Visayan Electric)', type: 'electricity', region: 'Cebu City', baseRate: 10.95, benchmarkAvg: 220 },
  { name: 'Davao Light (DLPC)', type: 'electricity', region: 'Davao City', baseRate: 10.40, benchmarkAvg: 220 },
  { name: 'CEBECO', type: 'electricity', region: 'Cebu Province', baseRate: 11.10, benchmarkAvg: 200 },
  { name: 'BENECO', type: 'electricity', region: 'Benguet', baseRate: 9.80, benchmarkAvg: 180 },
  { name: 'MORE Power', type: 'electricity', region: 'Iloilo', baseRate: 10.10, benchmarkAvg: 200 },
  { name: 'Other Electricity Provider', type: 'electricity', region: 'Nationwide', baseRate: 11.00, benchmarkAvg: 200 },
  { name: 'Manila Water', type: 'water', region: 'Metro Manila East', baseRate: 30.50, benchmarkAvg: 15 },
  { name: 'Maynilad', type: 'water', region: 'Metro Manila West', baseRate: 28.90, benchmarkAvg: 15 },
  { name: 'MCWD', type: 'water', region: 'Metro Cebu', baseRate: 27.50, benchmarkAvg: 14 },
  { name: 'DCWD', type: 'water', region: 'Davao City', baseRate: 25.00, benchmarkAvg: 13 },
  { name: 'Other Water District', type: 'water', region: 'Nationwide', baseRate: 25.00, benchmarkAvg: 12 },
];

async function main() {
  const envPath = path.join(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#')).forEach(l => {
    const [k, ...v] = l.split('=');
    env[k.trim()] = v.join('=').trim().replace(/['"]/g, '');
  });

  const client = createClient({ url: env.TURSO_DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN });

  console.log('--- Seeding Utility Providers ---');
  for (const p of STATIC_PROVIDERS) {
    try {
      console.log(`Adding ${p.name}...`);
      await client.execute({
        sql: 'INSERT INTO UtilityProvider (id, name, type, region, baseRate, benchmarkAvg, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        args: [crypto.randomUUID(), p.name, p.type, p.region, p.baseRate, p.benchmarkAvg, Date.now(), Date.now()]
      });
    } catch (e) {
      console.log(`  > ${p.name} already exists or error: ${e.message}`);
    }
  }
  console.log('Seeding complete!');
  process.exit(0);
}

main();
