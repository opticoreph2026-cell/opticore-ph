import 'server-only';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessCrm } from '@/lib/energy-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !canAccessCrm(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ownershipStatus = searchParams.get('ownershipStatus');
    const inverterId = searchParams.get('inverterId');
    const batteryId = searchParams.get('batteryId');

    const where: Record<string, unknown> = {};
    if (ownershipStatus) where.ownershipStatus = ownershipStatus;
    if (inverterId) where.inverterId = inverterId;
    if (batteryId) where.batteryId = batteryId;

    const inventory = await db.inventoryUnit.findMany({
      where,
      orderBy: { receivedDate: 'desc' },
      include: {
        inverter: { select: { modelName: true, sku: true } },
        battery: { select: { modelName: true, sku: true } },
      },
    });

    return NextResponse.json({ data: inventory });
  } catch (err) {
    console.error('[GET /api/energy/inventory]', err);
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
      inverterId,
      batteryId,
      serialNumber,
      ownershipStatus,
      storageLocation,
      receivedDate,
      consignmentRemitStatus,
      remitAmountCentavos,
      notes,
    } = body;

    if (!serialNumber) {
      return NextResponse.json({ error: 'serialNumber is required' }, { status: 400 });
    }

    const item = await db.inventoryUnit.create({
      data: {
        inverterId: inverterId || null,
        batteryId: batteryId || null,
        serialNumber,
        ownershipStatus: ownershipStatus || 'consigned_bytewatt',
        storageLocation: storageLocation || null,
        receivedDate: receivedDate ? new Date(receivedDate) : new Date(),
        consignmentRemitStatus: consignmentRemitStatus || 'not_applicable',
        remitAmountCentavos: remitAmountCentavos || 0,
        notes: notes || null,
      },
    });

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/energy/inventory]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
