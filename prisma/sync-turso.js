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
        console.error('Error adding Alert.type:', e.message);
      }
    }

    // 3. Add 'narrativeSummary' and 'potentialSavings' to 'AIReport'
    console.log('Checking AIReport columns...');
    try {
      await client.execute(`ALTER TABLE "AIReport" ADD COLUMN "narrativeSummary" TEXT;`);
      console.log('✅ Added "narrativeSummary" to "AIReport".');
    } catch (e) {
      if (!e.message.includes('duplicate column name')) console.error('Error adding narrativeSummary:', e.message);
    }
    try {
      await client.execute(`ALTER TABLE "AIReport" ADD COLUMN "potentialSavings" REAL;`);
      console.log('✅ Added "potentialSavings" to "AIReport".');
    } catch (e) {
      if (!e.message.includes('duplicate column name')) console.error('Error adding potentialSavings:', e.message);
    }

    // 4. Migrate UtilityReading.readingDate from String to DATETIME
    console.log('Checking UtilityReading.readingDate type...');
    try {
      // Check if the column is already DATETIME or needs migration
      // In SQLite, we can't easily check column type via SQL without pragma, 
      // but we can try to add the new column and migrate if it fails/succeeds.
      await client.execute(`ALTER TABLE "UtilityReading" ADD COLUMN "readingDate_new" DATETIME;`);
      console.log('Migrating UtilityReading.readingDate to DATETIME...');
      await client.execute(`UPDATE "UtilityReading" SET "readingDate_new" = datetime("readingDate") WHERE "readingDate" IS NOT NULL;`);
      await client.execute(`ALTER TABLE "UtilityReading" DROP COLUMN "readingDate";`);
      await client.execute(`ALTER TABLE "UtilityReading" RENAME COLUMN "readingDate_new" TO "readingDate";`);
      console.log('✅ UtilityReading.readingDate migrated to DATETIME.');
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log('ℹ️ readingDate migration already in progress or completed.');
      } else if (e.message.includes('no such column')) {
        console.log('ℹ️ readingDate already migrated.');
      } else {
        console.error('Error migrating readingDate:', e.message);
      }
    }

    // 5. Add Missing Indexes
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
      'CREATE INDEX IF NOT EXISTS "Transaction_clientId_idx" ON "Transaction"("clientId");',
      'CREATE INDEX IF NOT EXISTS "Property_clientId_idx" ON "Property"("clientId");',
      'CREATE INDEX IF NOT EXISTS "DailyMeterReading_clientId_idx" ON "DailyMeterReading"("clientId");'
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
