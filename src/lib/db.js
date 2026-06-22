import { PrismaClient } from '@prisma/client';

// ── Prisma Singleton ────────────────────────────────────────────────────────
// Supabase PostgreSQL — connection pooling via DATABASE_URL (pgbouncer)
// Use DIRECT_URL for migrations (prisma db push / migrate)

const globalForPrisma = globalThis;

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

// ── Common Query Helpers ────────────────────────────────────────────────────

export async function getErcRateForMonth(duCode, date) {
  const effectiveMonth = new Date(date.getFullYear(), date.getMonth(), 1);

  return await db.eRCRate.findFirst({
    where: {
      duCode,
      effectiveMonth: { lte: effectiveMonth },
    },
    orderBy: { effectiveMonth: 'desc' },
  });
}

export async function getWaterRateForDate(utilityCode, date) {
  return await db.waterRate.findFirst({
    where: {
      utilityCode,
      effectiveDate: { lte: date },
    },
    orderBy: { effectiveDate: 'desc' },
  });
}

export async function getProperty(propertyId, clientId) {
  return await db.property.findFirst({
    where: { id: propertyId, clientId },
  });
}
