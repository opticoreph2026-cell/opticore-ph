const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('--- OptiCore Migration: Add Unbundled Bill Fields to UtilityReading ---');
  
  const envPath = path.join(__dirname, '..', '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)$/);
    if (match) {
        let val = match[2].trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        env[match[1].trim()] = val;
    }
  });

  const url = env.TURSO_DATABASE_URL;
  const authToken = env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('Error: TURSO_DATABASE_URL or TURSO_AUTH_TOKEN missing in .env');
    process.exit(1);
  }

  const client = createClient({ url: url.split('?')[0], authToken });

  const columns = [
    { name: 'generationCharge',    type: 'REAL' },
    { name: 'transmissionCharge',  type: 'REAL' },
    { name: 'systemLoss',         type: 'REAL' },
    { name: 'distributionCharge',  type: 'REAL' },
    { name: 'subsidies',          type: 'REAL' },
    { name: 'governmentTax',      type: 'REAL' },
    { name: 'vat',                type: 'REAL' },
    { name: 'otherCharges',       type: 'REAL' },
    { name: 'effectiveRate',      type: 'REAL' },
    { name: 'sourceType',         type: 'TEXT' },
    { name: 'providerDetected',   type: 'TEXT' },
    { name: 'billingPeriod',      type: 'TEXT' },
  ];

  for (const col of columns) {
    try {
      console.log(`  Adding "${col.name}" (${col.type})...`);
      await client.execute(`ALTER TABLE UtilityReading ADD COLUMN ${col.name} ${col.type}`);
      console.log(`  ✅ Added.`);
    } catch (err) {
      if (err.message.includes('duplicate column name')) {
        console.log(`  ℹ️  Already exists, skipping.`);
      } else {
        console.error(`  ❌ Error:`, err.message);
      }
    }
  }
  
  console.log('\nSUCCESS: All unbundled bill fields synced to Turso!');
  process.exit(0);
}

main().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
