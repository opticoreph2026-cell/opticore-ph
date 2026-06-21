import 'server-only';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { canAccessCrm } from '@/lib/energy-auth';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !canAccessCrm(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    const where: any = {};
    if (customerId) where.customerId = customerId;

    const designs = await db.systemDesign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { fullName: true } },
        designedBy: { select: { fullName: true } },
      },
    });

    return NextResponse.json({ data: designs });
  } catch (err) {
    console.error('[GET /api/energy/designs]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !canAccessCrm(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      customerId,
      versionName,
      pathway,
      gridConnectionType,
      averageMonthlyKwh,
      peakSunHours,
      panelWattage,
      targetOffsetPct,
      criticalLoads, // array of loads
      computationTrace, // JSON string
      selectedInverterId,
      inverterQty,
      selectedBatteryId,
      batteryQty,
      pvArrayKwp,
      panelCount,
      totalUsableStorageKwh,
      systemTier,
      isParallel,
      cableContinuousCurrentA,
      cableMinAmpacityA,
      cableOcpdRatingA,
      cableAwg,
      cableMmSq,
      status,
    } = body;

    const design = await db.systemDesign.create({
      data: {
        customerId,
        designedById: session.sub,
        versionName: versionName || 'Draft v1',
        pathway: pathway || 'zero_export_hybrid',
        gridConnectionType: gridConnectionType || 'single_phase',
        averageMonthlyKwh: averageMonthlyKwh || 0,
        peakSunHours: peakSunHours || 5.1,
        panelWattage: panelWattage || 550,
        targetOffsetPct: targetOffsetPct || 80,
        criticalLoads: criticalLoads ? JSON.stringify(criticalLoads) : '[]',
        computationTrace: computationTrace ? JSON.stringify(computationTrace) : '{}',
        selectedInverterId,
        inverterQty: inverterQty || 1,
        selectedBatteryId,
        batteryQty: batteryQty || 1,
        pvArrayKwp: pvArrayKwp || 0,
        panelCount: panelCount || 0,
        totalUsableStorageKwh: totalUsableStorageKwh || 0,
        systemTier: systemTier || 'starter_residential',
        isParallel: isParallel || false,
        cableContinuousCurrentA: cableContinuousCurrentA || 0,
        cableMinAmpacityA: cableMinAmpacityA || 0,
        cableOcpdRatingA: cableOcpdRatingA || 0,
        cableAwg: cableAwg || '',
        cableMmSq: cableMmSq || '',
        status: status || 'draft',
      },
    });

    return NextResponse.json({ data: design }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/energy/designs]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
