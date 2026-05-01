import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const url = process.env.TURSO_DATABASE_URL || '';
const authToken = process.env.TURSO_AUTH_TOKEN || '';

const client = createClient({ url, authToken });

async function main() {
  console.log('Syncing Turso schema for Phase 5...');

  try {
    console.log('Adding emailVerified to Client...');
    try { await client.execute(`ALTER TABLE "Client" ADD COLUMN "emailVerified" DATETIME;`); } catch (e: any) {
      if (!e.message.includes('duplicate column name')) console.error(e);
    }
    
    console.log('Adding lastSignedInAt and locale to Client...');
    try { await client.execute(`ALTER TABLE "Client" ADD COLUMN "lastSignedInAt" DATETIME;`); } catch (e: any) {
      if (!e.message.includes('duplicate column name')) console.error(e);
    }
    try { await client.execute(`ALTER TABLE "Client" ADD COLUMN "locale" TEXT DEFAULT 'en';`); } catch (e: any) {
      if (!e.message.includes('duplicate column name')) console.error(e);
    }

    console.log('Creating AuthProvider table...');
    await client.execute(`
      CREATE TABLE IF NOT EXISTS "AuthProvider" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "clientId" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerId" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "emailVerified" BOOLEAN NOT NULL DEFAULT 0,
        "metadata" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "lastUsedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AuthProvider_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    
    await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "AuthProvider_provider_providerId_key" ON "AuthProvider"("provider", "providerId");`);
    await client.execute(`CREATE INDEX IF NOT EXISTS "AuthProvider_clientId_idx" ON "AuthProvider"("clientId");`);
    await client.execute(`CREATE INDEX IF NOT EXISTS "AuthProvider_email_idx" ON "AuthProvider"("email");`);

    console.log('Creating SignInEvent table...');
    await client.execute(`
      CREATE TABLE IF NOT EXISTS "SignInEvent" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "clientId" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "success" BOOLEAN NOT NULL,
        "failReason" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SignInEvent_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    
    await client.execute(`CREATE INDEX IF NOT EXISTS "SignInEvent_clientId_createdAt_idx" ON "SignInEvent"("clientId", "createdAt" DESC);`);

    console.log('✅ Phase 5 Turso schema sync complete!');
  } catch (err) {
    console.error('❌ Sync failed:', err);
  } finally {
    client.close();
  }
}

main();
