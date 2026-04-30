const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env');
  process.exit(1);
}

async function sync() {
  const client = createClient({ url, authToken });

  console.log('Syncing Turso schema...');

  try {
    // 1. Create RefreshToken table if it doesn't exist
    console.log('Checking RefreshToken table...');
    await client.execute(`
      CREATE TABLE IF NOT EXISTS "RefreshToken" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "token" TEXT NOT NULL,
        "clientId" TEXT NOT NULL,
        "expiresAt" DATETIME NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "RefreshToken_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "RefreshToken_token_key" ON "RefreshToken"("token");`);
    await client.execute(`CREATE INDEX IF NOT EXISTS "RefreshToken_clientId_idx" ON "RefreshToken"("clientId");`);
    console.log('✅ RefreshToken table is ready.');

    // 2. Add 'type' column to 'Alert' table if it doesn't exist
    console.log('Checking Alert.type column...');
    try {
      await client.execute(`ALTER TABLE "Alert" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'rate';`);
      console.log('✅ Added "type" column to "Alert" table.');
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log('ℹ️ "type" column already exists in "Alert" table.');
      } else {
        throw e;
      }
    }

    // 3. Add Missing Indexes
    console.log('Checking missing indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS "UtilityReading_clientId_idx" ON "UtilityReading"("clientId");',
      'CREATE INDEX IF NOT EXISTS "UtilityReading_propertyId_idx" ON "UtilityReading"("propertyId");',
      'CREATE INDEX IF NOT EXISTS "AIReport_clientId_idx" ON "AIReport"("clientId");',
      'CREATE INDEX IF NOT EXISTS "AIReport_propertyId_idx" ON "AIReport"("propertyId");',
      'CREATE INDEX IF NOT EXISTS "Alert_clientId_idx" ON "Alert"("clientId");',
      'CREATE INDEX IF NOT EXISTS "Alert_isRead_idx" ON "Alert"("isRead");',
      'CREATE INDEX IF NOT EXISTS "Appliance_clientId_idx" ON "Appliance"("clientId");',
      'CREATE INDEX IF NOT EXISTS "Appliance_propertyId_idx" ON "Appliance"("propertyId");',
      'CREATE INDEX IF NOT EXISTS "ApplianceCatalog_category_brand_idx" ON "ApplianceCatalog"("category", "brand");',
      'CREATE INDEX IF NOT EXISTS "LPGReading_clientId_idx" ON "LPGReading"("clientId");',
      'CREATE INDEX IF NOT EXISTS "LPGReading_propertyId_idx" ON "LPGReading"("propertyId");',
      'CREATE INDEX IF NOT EXISTS "Transaction_clientId_idx" ON "Transaction"("clientId");'
    ];

    for (const sql of indexes) {
      await client.execute(sql);
    }
    console.log('✅ Missing indexes added.');

    console.log('🚀 Turso schema sync complete!');
  } catch (err) {
    console.error('❌ Sync failed:', err.message);
  } finally {
    client.close();
  }
}

sync();
