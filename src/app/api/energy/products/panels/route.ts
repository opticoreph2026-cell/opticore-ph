import 'server-only';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const panels = await db.solarPanel.findMany({
      where: { active: true },
      select: {
        id: true,
        modelName: true,
        manufacturer: true,
        wattage: true,
        efficiencyPct: true,
        cellType: true,
        unitPrice: true,
        isPriceConfirmed: true,
        datasheetUrl: true,
      },
      orderBy: { wattage: 'asc' },
    });

    return NextResponse.json({ data: panels });
  } catch (err) {
    console.error('[GET /api/energy/products/panels]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
