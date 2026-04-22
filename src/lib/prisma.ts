import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import path from 'path';

// Force strictly the local DATABASE_URL so it doesn't accidentally hit the cloud yet!
let dbUrl = process.env.DATABASE_URL || 'file:./dev.db';

if (dbUrl.includes('file:')) {
  // Translate to an absolute, un-confusable path explicitly for Next.js and the LibSQL driver on Windows
  dbUrl = 'file:' + path.join(process.cwd(), 'dev.db');
}

const dbConfig = {
  url: dbUrl,
  authToken: process.env.TURSO_AUTH_TOKEN,
};

// Extremely Clean Next.js + Prisma V7 singleton
// We strictly define a completely new cache signature to bypass poisoned Next.js compiler chunks.
const globalForPrisma = global as unknown as { prisma_v5: PrismaClient };

// We must securely inject PrismaLibSql. We appended it to next.config.js to prevent Edge corruption.
export const prisma =
  globalForPrisma.prisma_v5 ||
  new PrismaClient({
    adapter: new PrismaLibSql(dbConfig)
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma_v5 = prisma;
