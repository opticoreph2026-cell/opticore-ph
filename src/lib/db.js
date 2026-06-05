import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

// ── Prisma Singleton ────────────────────────────────────────────────────────
// Prevent multiple instances of Prisma Client in development

const globalForPrisma = globalThis

let prismaClient

if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
  // Production / Turso branch
  const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
  const adapter = new PrismaLibSQL(libsql)
  prismaClient = globalForPrisma.prisma || new PrismaClient({ adapter })
} else {
  // Local SQLite fallback branch
  prismaClient = globalForPrisma.prisma || new PrismaClient()
}

export const db = prismaClient

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient

// ── Common Query Helpers ────────────────────────────────────────────────────
// These helpers encapsulate common logic across the app to reduce duplication.

/**
 * Gets the latest ERC rate for a specific DU code on a given date
 */
export async function getErcRateForMonth(duCode, date) {
  // Align date to first of the month
  const effectiveMonth = new Date(date.getFullYear(), date.getMonth(), 1)
  
  return await db.eRCRate.findFirst({
    where: {
      duCode,
      effectiveMonth: {
        lte: effectiveMonth
      }
    },
    orderBy: {
      effectiveMonth: 'desc'
    }
  })
}

/**
 * Gets the active water rate for a utility on a given date
 */
export async function getWaterRateForDate(utilityCode, date) {
  return await db.waterRate.findFirst({
    where: {
      utilityCode,
      effectiveDate: {
        lte: date
      }
    },
    orderBy: {
      effectiveDate: 'desc'
    }
  })
}

/**
 * Validates ownership of a property
 */
export async function getProperty(propertyId, clientId) {
  return await db.property.findFirst({
    where: {
      id: propertyId,
      clientId: clientId
    }
  })
}
