const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('--- OptiCore Migration: Add Quantity Column ---');
  
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

  try {
    console.log('Adding column "quantity" to "Appliance" table...');
    await client.execute('ALTER TABLE Appliance ADD COLUMN quantity INTEGER DEFAULT 1');
    console.log('SUCCESS: Column added!');
  } catch (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('INFO: Column already exists.');
    } else {
      console.error('ERROR:', err.message);
    }
  }
  
  process.exit(0);
}

main().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
