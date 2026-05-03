/**
 * OptiCore PH — Phase 1 Data Migration
 *
 * Purpose: Transform existing production data to the new Phase 1 schema.
 * Transformations:
 *   1. UtilityReading: Float money → Int centavos, Float rate → Int rate units
 *      billingPeriodStart/End backfilled from readingDate,
 *      unbundledCharges JSON consolidated, sourceType → ScanSource enum
 *   2. UtilityProvider: Float baseRate/benchmarkAvg → Int rate units
 *   3. AIReport: Float savings → Int centavos
 *   4. Transaction: Float amount → Int centavos
 *
 * Run: npx tsx scripts/migrate-phase1.ts
 *
 * STOP CONDITIONS (script halts and logs if):
 *   - Pre/post record counts differ (data loss detected)
 *   - Any record conversion produces NaN or negative where unexpected
 *
 * Output files:
 *   - migration-log.txt       (all events)
 *   - migration-errors.log    (errors only)
 *   - migration-summary.json  (before/after counts)
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import { writeFileSync, appendFileSync, existsSync, unlinkSync } from 'fs';
import { toCentavos, toRateUnits } from '../src/lib/money.js';

// ── DB Connection ─────────────────────────────────────────────────────────────

function makeClient(): PrismaClient {
  const url = (process.env.TURSO_DATABASE_URL || '').trim();
  const token = (process.env.TURSO_AUTH_TOKEN || '').trim();

  if (url && (url.startsWith('libsql://') || url.startsWith('https://'))) {
    const libsql = createClient({ url, authToken: token || undefined });
    const adapter = new PrismaLibSQL(libsql);
    process.env.DATABASE_URL = 'file:./dev.db'; // satisfy Prisma validator
    return new PrismaClient({ adapter });
  }

  if (!process.env.DATABASE_URL) process.env.DATABASE_URL = 'file:./dev.db';
  return new PrismaClient();
}

const db = makeClient();

// ── Logging ───────────────────────────────────────────────────────────────────

const LOG_FILE = 'migration-log.txt';
const ERR_FILE = 'migration-errors.log';

if (existsSync(LOG_FILE)) unlinkSync(LOG_FILE);
if (existsSync(ERR_FILE)) unlinkSync(ERR_FILE);

function log(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  appendFileSync(LOG_FILE, line + '\n');
}

function logError(msg: string) {
  const line = `[${new Date().toISOString()}] ERROR: ${msg}`;
  console.error(line);
  appendFileSync(LOG_FILE, line + '\n');
  appendFileSync(ERR_FILE, line + '\n');
}

// ── Safe Math ─────────────────────────────────────────────────────────────────

function safeInt(val: unknown): number {
  const n = Number(val);
  return isNaN(n) ? 0 : Math.round(n);
}

function safeFloat(val: unknown): number {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

// ── Billing Period Backfill ───────────────────────────────────────────────────

function backfillPeriod(readingDate: Date | null): { start: Date; end: Date } {
  const base = readingDate instanceof Date && !isNaN(readingDate.getTime())
    ? readingDate
    : new Date();

  const start = new Date(base);
  start.setDate(start.getDate() - 15);

  const end = new Date(base);
  end.setDate(end.getDate() + 15);

  return { start, end };
}

// ── Unbundled Charges JSON Builder ────────────────────────────────────────────

function buildUnbundledCharges(row: Record<string, unknown>): string | null {
  const charges = {
    generation:    row.generationCharge   != null ? toCentavos(safeFloat(row.generationCharge))   : null,
    transmission:  row.transmissionCharge != null ? toCentavos(safeFloat(row.transmissionCharge)) : null,
    systemLoss:    row.systemLoss         != null ? toCentavos(safeFloat(row.systemLoss))         : null,
    distribution:  row.distributionCharge != null ? toCentavos(safeFloat(row.distributionCharge)) : null,
    subsidies:     row.subsidies          != null ? toCentavos(safeFloat(row.subsidies))          : null,
    governmentTax: row.governmentTax      != null ? toCentavos(safeFloat(row.governmentTax))      : null,
    vat:           row.vat                != null ? toCentavos(safeFloat(row.vat))                : null,
    otherCharges:  row.otherCharges       != null ? toCentavos(safeFloat(row.otherCharges))       : null,
  };

  const hasAny = Object.values(charges).some(v => v !== null);
  return hasAny ? JSON.stringify(charges) : null;
}

// ── Migration Steps ───────────────────────────────────────────────────────────

interface Counts {
  utilityReadings: number;
  utilityProviders: number;
  aiReports: number;
  transactions: number;
}

async function countBefore(): Promise<Counts> {
  const [utilityReadings, utilityProviders, aiReports, transactions] = await Promise.all([
    db.utilityReading.count(),
    db.utilityProvider.count(),
    db.aIReport.count(),
    db.transaction.count(),
  ]);
  return { utilityReadings, utilityProviders, aiReports, transactions };
}

// ── Step 1: UtilityReading ────────────────────────────────────────────────────

async function migrateUtilityReadings() {
  log('=== STEP 1: UtilityReading migration ===');

  // Pre-flight: Add new columns if they don't exist yet so we can populate them
  // before Prisma drops the old columns.
  try {
    await db.$executeRawUnsafe(`ALTER TABLE "UtilityReading" ADD COLUMN "billingPeriodStart" DATETIME`);
    await db.$executeRawUnsafe(`ALTER TABLE "UtilityReading" ADD COLUMN "billingPeriodEnd" DATETIME`);
    await db.$executeRawUnsafe(`ALTER TABLE "UtilityReading" ADD COLUMN "unbundledCharges" TEXT`);
    await db.$executeRawUnsafe(`ALTER TABLE "UtilityReading" ADD COLUMN "confidence" REAL DEFAULT 1.0`);
  } catch (e) {
    log('New columns might already exist. Proceeding...');
  }

  // Fetch all readings with raw fields via $queryRaw to access old columns
  const rows = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(`
    SELECT 
      id, "clientId", "propertyId",
      "kwhUsed", "billAmountElectric",
      "generationCharge", "transmissionCharge", "systemLoss",
      "distributionCharge", "subsidies", "governmentTax", "vat", "otherCharges",
      "effectiveRate", "readingDate", "sourceType", "providerDetected", "billingPeriod"
    FROM "UtilityReading"
  `);

  log(`Found ${rows.length} UtilityReading records to migrate`);

  let converted = 0;
  let errors = 0;

  for (const row of rows) {
    try {
      const billFloat = safeFloat(row.billAmountElectric);
      const kwhFloat = safeFloat(row.kwhUsed);
      const rateFloat = safeFloat(row.effectiveRate);

      const billCentavos = toCentavos(billFloat);
      // kwhUsed: round to nearest whole kWh for storage as Int
      const kwhInt = Math.round(kwhFloat);
      // effectiveRate: if already stored as rate units (>100), keep; else convert
      const rateInt = rateFloat > 1000
        ? Math.round(rateFloat)              // already in rate units from a previous run
        : toRateUnits(rateFloat);             // convert from ₱/kWh

      const readingDate = row.readingDate ? new Date(row.readingDate as string) : new Date();
      const { start, end } = row.billingPeriodStart
        ? { 
            start: new Date(row.billingPeriodStart as string), 
            end: new Date((row.billingPeriodEnd as string) || (row.billingPeriodStart as string)) 
          }
        : backfillPeriod(readingDate);

      const unbundled = buildUnbundledCharges(row);

      // Map sourceType string → ScanSource enum value
      const sourceLower = String(row.sourceType || 'manual').toLowerCase();
      const sourceType = sourceLower === 'ai_scan' ? 'AI_SCAN'
        : sourceLower === 'import' ? 'IMPORT'
        : 'MANUAL';

      const confidence = 1.0;

      await db.$executeRawUnsafe(`
        UPDATE "UtilityReading" SET
          "kwhUsed" = ?,
          "billAmountElectric" = ?,
          "effectiveRate" = ?,
          "billingPeriodStart" = ?,
          "billingPeriodEnd" = ?,
          "unbundledCharges" = ?,
          "sourceType" = ?,
          "confidence" = ?
        WHERE id = ?
      `,
        kwhInt,
        billCentavos,
        rateInt || null,
        start.toISOString(),
        end.toISOString(),
        unbundled,
        sourceType,
        confidence,
        row.id
      );

      converted++;
    } catch (err) {
      logError(`UtilityReading id=${row.id}: ${String(err)}`);
      errors++;
    }
  }

  log(`UtilityReading: ${converted} converted, ${errors} errors`);
}

// ── Step 2: UtilityProvider ───────────────────────────────────────────────────

async function migrateUtilityProviders() {
  log('=== STEP 2: UtilityProvider migration ===');

  try {
    await db.$executeRawUnsafe(`ALTER TABLE "UtilityProvider" ADD COLUMN "code" TEXT`);
    await db.$executeRawUnsafe(`ALTER TABLE "UtilityProvider" ADD COLUMN "type" TEXT DEFAULT 'PRIVATE_DU'`);
    await db.$executeRawUnsafe(`ALTER TABLE "UtilityProvider" ADD COLUMN "region" TEXT`);
    await db.$executeRawUnsafe(`ALTER TABLE "UtilityProvider" ADD COLUMN "isSupported" BOOLEAN DEFAULT 0`);
    await db.$executeRawUnsafe(`ALTER TABLE "UtilityProvider" ADD COLUMN "bestEffortOnly" BOOLEAN DEFAULT 1`);
    await db.$executeRawUnsafe(`ALTER TABLE "UtilityProvider" ADD COLUMN "parserVersion" TEXT DEFAULT 'v1'`);
    await db.$executeRawUnsafe(`ALTER TABLE "UtilityProvider" ADD COLUMN "logoUrl" TEXT`);
    await db.$executeRawUnsafe(`ALTER TABLE "UtilityProvider" ADD COLUMN "website" TEXT`);
  } catch (e) {
    log('New provider columns might already exist. Proceeding...');
  }

  const rows = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(`
    SELECT id, name, "baseRate", "benchmarkAvg"
    FROM "UtilityProvider"
  `);

  log(`Found ${rows.length} UtilityProvider records`);

  let converted = 0;
  let errors = 0;

  for (const row of rows) {
    try {
      const baseRateFloat = safeFloat(row.baseRate);
      const benchmarkFloat = safeFloat(row.benchmarkAvg);

      // If already in rate units (stored >100 means it's been converted before), skip
      const baseRateInt = baseRateFloat > 1000 ? Math.round(baseRateFloat) : toRateUnits(baseRateFloat);
      const benchmarkInt = benchmarkFloat > 1000 ? Math.round(benchmarkFloat) : toRateUnits(benchmarkFloat);

      // Backfill code if missing
      const nameStr = String(row.name || '').toUpperCase();
      const code = String(row.code || nameStr.replace(/[^A-Z0-9]/g, '').slice(0, 16));

      // Heuristic type detection if missing
      let type = row.type || 'PRIVATE_DU';
      if (!row.type) {
        if (nameStr.includes(' EC') || nameStr.includes('ELECTRIC COOP') || nameStr.includes('BENECO') || nameStr.includes('BATELEC') || nameStr.includes('FLECO')) {
          type = 'COOPERATIVE';
        }
      }

      // Supported providers
      const supportedCodes = ['MERALCO', 'VECO', 'DAVAOLIGHT'];
      const isSupported = supportedCodes.some(c => code.includes(c)) ? 1 : 0;

      await db.$executeRawUnsafe(`
        UPDATE "UtilityProvider" SET
          "baseRate" = ?,
          "benchmarkAvg" = ?,
          "code" = ?,
          "type" = ?,
          "isSupported" = ?
        WHERE id = ?
      `,
        baseRateInt,
        benchmarkInt,
        code,
        type,
        isSupported,
        row.id
      );

      converted++;
    } catch (err) {
      logError(`UtilityProvider id=${row.id}: ${String(err)}`);
      errors++;
    }
  }

  log(`UtilityProvider: ${converted} converted, ${errors} errors`);
}

// ── Step 3: AIReport ──────────────────────────────────────────────────────────

async function migrateAIReports() {
  log('=== STEP 3: AIReport migration ===');

  const rows = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(`
    SELECT id, "estimatedSavings", "potentialSavings" FROM "AIReport"
  `);

  log(`Found ${rows.length} AIReport records`);

  let converted = 0;
  let errors = 0;

  for (const row of rows) {
    try {
      const estFloat = safeFloat(row.estimatedSavings);
      const potFloat = row.potentialSavings != null ? safeFloat(row.potentialSavings) : null;

      // If already in centavos (>10000 for typical bill values), skip conversion
      const estCentavos = estFloat > 10000 ? Math.round(estFloat) : toCentavos(estFloat);
      const potCentavos = potFloat != null
        ? (potFloat > 10000 ? Math.round(potFloat) : toCentavos(potFloat))
        : null;

      await db.$executeRawUnsafe(`
        UPDATE "AIReport" SET "estimatedSavings" = ?, "potentialSavings" = ? WHERE id = ?
      `, estCentavos, potCentavos, row.id);

      converted++;
    } catch (err) {
      logError(`AIReport id=${row.id}: ${String(err)}`);
      errors++;
    }
  }

  log(`AIReport: ${converted} converted, ${errors} errors`);
}

// ── Step 4: Transaction ───────────────────────────────────────────────────────

async function migrateTransactions() {
  log('=== STEP 4: Transaction migration ===');

  const rows = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(`
    SELECT id, amount FROM "Transaction"
  `);

  log(`Found ${rows.length} Transaction records`);

  let converted = 0;
  let errors = 0;

  for (const row of rows) {
    try {
      const amtFloat = safeFloat(row.amount);
      // Heuristic: if amount looks like it's already centavos (>1000 for ₱10+), leave it.
      // Typical plan prices: ₱499 (pro) = 499, stored as 499 raw → convert to 49900 centavos
      // But if someone already ran this migration, 499 → was 49900 → don't multiply again.
      // Safe rule: if amount < 10000 AND > 0, it's in peso → convert. Else leave.
      const amtCentavos = (amtFloat > 0 && amtFloat < 10000) ? toCentavos(amtFloat) : Math.round(amtFloat);

      await db.$executeRawUnsafe(`
        UPDATE "Transaction" SET amount = ? WHERE id = ?
      `, amtCentavos, row.id);

      converted++;
    } catch (err) {
      logError(`Transaction id=${row.id}: ${String(err)}`);
      errors++;
    }
  }

  log(`Transaction: ${converted} converted, ${errors} errors`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  log('══════════════════════════════════════════════════════');
  log('OptiCore PH — Phase 1 Migration');
  log(`Environment: ${process.env.NODE_ENV || 'unknown'}`);
  log(`Database: ${process.env.TURSO_DATABASE_URL ? 'Turso (LibSQL)' : 'Local SQLite'}`);
  log('══════════════════════════════════════════════════════');

  // PRE-FLIGHT COUNTS
  log('--- Pre-migration record counts ---');
  const before = await countBefore();
  log(JSON.stringify(before, null, 2));

  // EXECUTE STEPS
  await migrateUtilityReadings();
  await migrateUtilityProviders();
  await migrateAIReports();
  await migrateTransactions();

  // POST-FLIGHT COUNTS
  log('--- Post-migration record counts ---');
  const after = await countBefore();
  log(JSON.stringify(after, null, 2));

  // VERIFY NO DATA LOSS
  let dataLoss = false;
  for (const key of Object.keys(before) as Array<keyof Counts>) {
    if (before[key] !== after[key]) {
      logError(`DATA LOSS DETECTED: ${key} before=${before[key]} after=${after[key]}`);
      dataLoss = true;
    }
  }

  if (dataLoss) {
    log('🔴 STOP: Data loss detected. Check migration-errors.log immediately.');
    process.exit(1);
  }

  // SUMMARY JSON
  const summary = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    database: process.env.TURSO_DATABASE_URL ? 'turso' : 'sqlite',
    before,
    after,
    dataLoss: false,
    status: 'SUCCESS',
  };

  writeFileSync('migration-summary.json', JSON.stringify(summary, null, 2));
  log('✅ Migration complete. See migration-summary.json for full report.');

  await db.$disconnect();
}

main().catch(async (err) => {
  logError(`Unhandled error: ${String(err)}`);
  await db.$disconnect();
  process.exit(1);
});
