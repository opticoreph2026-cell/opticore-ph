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
    const siteId = searchParams.get('siteId');

    const where: { siteId?: string } = {};
    if (siteId) where.siteId = siteId;

    const designs = await db.systemDesign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        site: {
          select: {
            customer: { select: { fullName: true, id: true } },
          },
        },
        designedBy: { select: { fullName: true } },
        inverter: { select: { modelName: true, sku: true } },
        battery: { select: { modelName: true, usableKwh: true } },
        bomItems: true,
        roiScenarios: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    return NextResponse.json({ data: designs });
  } catch (err) {
    console.error('[GET /api/energy/designs]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
