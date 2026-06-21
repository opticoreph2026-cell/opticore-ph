/**
 * GET  /api/energy/products — list all active inverters and batteries
 * Used by: Design wizard step 3, Admin catalog, ROI engine
 */
import 'server-only';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [inverters, batteries] = await Promise.all([
      db.productInverter.findMany({
        where: { active: true },
        select: {
          id: true,
          sku: true,
          modelName: true,
          family: true,
          phase: true,
          ratedAcKw: true,
          maxPvInputKw: true,
          backupSurgeKw: true,
          transferTimeMs: true,
          maxParallelUnits: true,
          peakEfficiencyPct: true,
          ipRating: true,
          certificationNotes: true,
          datasheetUrl: true,
          unitPriceCentavos: true,
          isPriceConfirmed: true,
          priceNote: true,
        },
        orderBy: [{ family: 'asc' }, { ratedAcKw: 'asc' }],
      }),
      db.productBattery.findMany({
        where: { active: true },
        select: {
          id: true,
          sku: true,
          modelName: true,
          compatibleInverterFamily: true,
          nominalKwh: true,
          usableKwh: true,
          dodPct: true,
          chemistry: true,
          cycleLife: true,
          warrantyYears: true,
          roundTripEfficiencyPct: true,
          dimensionsMm: true,
          weightKg: true,
          ipRating: true,
          datasheetUrl: true,
          unitPriceCentavos: true,
          isPriceConfirmed: true,
          priceNote: true,
        },
        orderBy: [{ compatibleInverterFamily: 'asc' }, { nominalKwh: 'asc' }],
      }),
    ]);

    return NextResponse.json({ data: { inverters, batteries } });
  } catch (err) {
    console.error('[GET /api/energy/products]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
