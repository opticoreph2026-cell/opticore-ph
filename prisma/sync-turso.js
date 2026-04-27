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

    console.log('🚀 Turso schema sync complete!');
  } catch (err) {
    console.error('❌ Sync failed:', err.message);
  } finally {
    client.close();
  }
}

sync();
