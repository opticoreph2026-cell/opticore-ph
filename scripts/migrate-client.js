const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

async function main() {
  // Load .env
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env file not found');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#')).forEach(line => {
    const [key, ...parts] = line.split('=');
    let val = parts.join('=').trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    env[key.trim()] = val;
  });

  const url = env.TURSO_DATABASE_URL;
  const authToken = env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('Error: TURSO_DATABASE_URL or TURSO_AUTH_TOKEN missing in .env');
    process.exit(1);
  }

  const client = createClient({
    url: url.split('?')[0],
    authToken: authToken
  });

  try {
    console.log('--- Migrating Remote Turso Client Table ---');
    
    try {
      console.log('Adding googleId column...');
      await client.execute('ALTER TABLE Client ADD COLUMN googleId TEXT');
    } catch (e) {
      console.log('  > googleId column might already exist or error:', e.message);
    }

    try {
      console.log('Adding applianceCount column...');
      await client.execute('ALTER TABLE Client ADD COLUMN applianceCount INTEGER DEFAULT 0');
    } catch (e) {
      console.log('  > applianceCount column might already exist or error:', e.message);
    }

    try {
      console.log('Creating unique index for googleId...');
      await client.execute('CREATE UNIQUE INDEX Client_googleId_key ON Client(googleId)');
    } catch (e) {
      console.log('  > Index might already exist or error:', e.message);
    }

    console.log('\nMigration script finished.');
  } catch (e) {
    console.error('Fatal Migration Error:', e.message);
  } finally {
    process.exit(0);
  }
}

main();
