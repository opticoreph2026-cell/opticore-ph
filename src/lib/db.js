import { PrismaClient } from '@prisma/client';

// ── Prisma Singleton ────────────────────────────────────────────────────────
// Supabase PostgreSQL — connection pooling via DATABASE_URL (pgbouncer)
// Use DIRECT_URL for migrations (prisma db push / migrate)

const globalForPrisma = globalThis;

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
