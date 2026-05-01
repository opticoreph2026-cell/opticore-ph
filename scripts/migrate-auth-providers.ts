import * as dotenv from 'dotenv';
import path from 'path';

// Load .env first, then .env.local (which overrides)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

const tursoUrl = (process.env.TURSO_DATABASE_URL || '').trim();
const tursoToken = (process.env.TURSO_AUTH_TOKEN || '').trim();

let db: PrismaClient;

if (tursoUrl && (tursoUrl.startsWith('libsql://') || tursoUrl.startsWith('https://'))) {
  const libsql = createClient({
    url: tursoUrl,
    authToken: tursoToken || undefined,
  });
  const adapter = new PrismaLibSQL(libsql);
  db = new PrismaClient({ adapter });
} else {
  // Local SQLite
  db = new PrismaClient();
}

async function main() {
  console.log('=== Migrating AuthProviders ===');
  
  const clients = await db.client.findMany({
    where: {
      passwordHash: { not: null }
    }
  });
  
  console.log(`Found ${clients.length} clients with passwords.`);
  
  let migratedCount = 0;
  for (const client of clients) {
    // Check if auth provider already exists to be idempotent
    const existing = await db.authProvider.findFirst({
      where: {
        clientId: client.id,
        provider: 'PASSWORD'
      }
    });
    
    if (!existing) {
      await db.authProvider.create({
        data: {
          clientId: client.id,
          provider: 'PASSWORD',
          providerId: client.id,
          email: client.email,
          emailVerified: !!client.emailVerified,
        }
      });
      migratedCount++;
    }
  }
  
  console.log(`Migrated ${migratedCount} new AuthProviders.`);
  
  console.log('=== ✅ Migration complete ===');
}

main()
  .catch(console.error)
  .finally(async () => {
    await db.$disconnect();
  });
