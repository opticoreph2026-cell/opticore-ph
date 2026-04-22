// scripts/sync-cloud.js
const { execSync } = require('child_process');
const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// 1. Load environment variables manually
const envPath = path.join(__dirname, '../.env');
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

const url = env.TURSO_DATABASE_URL || env.DATABASE_URL;
const authToken = env.TURSO_AUTH_TOKEN;

if (!url || !url.includes('turso.io')) {
  console.error("❌ Error: No Turso URL found in .env");
  process.exit(1);
}

async function sync() {
  console.log(`🚀 Starting Cloud Sync to: ${url}`);

  try {
    // 2. Generate SQL from Prisma Schema
    console.log("📄 Generating SQL from schema...");
    const sql = execSync('npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script', { encoding: 'utf8' });

    // 3. Connect to Turso
    const client = createClient({
      url: url.replace('libsql://', 'https://'),
      authToken: authToken,
    });

    // 4. Execute SQL
    console.log("⚡ Preparing batch sync...");
    
    // 1. Remove all SQL comments (single line and multi-line)
    const cleanSql = sql
      .replace(/--.*$/gm, '')           // Remove -- comments
      .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove /* */ comments
    
    // 2. Split into individual statements and clean them up
    const statements = cleanSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => ({ sql: s }));

    // 5. Drop old tables
    const tableNames = sql.match(/CREATE TABLE "([^"]+)"/g)?.map(m => m.match(/"([^"]+)"/)[1]) || [];
    if (tableNames.length > 0) {
      console.log(`⚡ Dropping ${tableNames.length} existing tables...`);
      await client.batch(tableNames.map(t => ({ sql: `DROP TABLE IF EXISTS "${t}"` })), "write");
    }

    // 6. Create new tables
    console.log(`⚡ Executing ${statements.length} schema statements in batch...`);
    await client.batch(statements, "write");

    // 7. Verify tables
    const verify = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
    const tables = verify.rows.map(r => r.name);
    console.log("📊 Tables currently in Cloud DB:", tables.join(', '));

    console.log("✅ Successfully synced schema to Turso!");
    
    // 8. Run Seed
    console.log("🌱 Running database seed...");
    execSync('node prisma/seed.js', { stdio: 'inherit' });
    console.log("✅ Seed complete!");

  } catch (error) {
    console.error("❌ Sync failed:");
    console.error(error.message);
    process.exit(1);
  }
}

sync();
