import 'server-only';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessCrm } from '@/lib/energy-auth';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !canAccessCrm(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemType = searchParams.get('itemType'); // "inverter" | "battery" | "panel" | "accessory"
    const status = searchParams.get('status');

    const where: any = {};
    if (itemType) where.itemType = itemType;
    if (status) where.status = status;

    const inventory = await db.inventoryItem.findMany({
      where,
      orderBy: { receivedAt: 'desc' },
      include: {
        allocatedTo: { select: { projectId: true, installedAt: true } },
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
    // Only OptiCore staff and owners should add inventory globally
    // We could restrict to canAccessAdminEnergy or canAccessCrm.
    if (!session || !canAccessCrm(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      itemType,
      modelIdentifier,
      serialNumber,
      supplier,
      costCentavos,
      receivedAt,
      warrantyExpiresAt,
      location,
      status,
    } = body;

    if (!itemType || !modelIdentifier || !serialNumber) {
      return NextResponse.json({ error: 'itemType, modelIdentifier, and serialNumber are required' }, { status: 400 });
    }

    const item = await db.inventoryItem.create({
      data: {
        itemType,
        modelIdentifier,
        serialNumber,
        supplier: supplier || '',
        costCentavos: costCentavos || 0,
        receivedAt: receivedAt ? new Date(receivedAt) : new Date(),
        warrantyExpiresAt: warrantyExpiresAt ? new Date(warrantyExpiresAt) : null,
        location: location || 'Main Warehouse',
        status: status || 'in_stock',
      },
    });

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/energy/inventory]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
