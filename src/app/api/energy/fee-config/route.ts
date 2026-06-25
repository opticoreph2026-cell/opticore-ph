import 'server-only';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessAdminEnergy } from '@/lib/energy-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getOrCreateConfig() {
  let config = await db.feeConfiguration.findFirst();
  if (!config) {
    config = await db.feeConfiguration.create({ data: {} });
  }
  return config;
}

export async function GET() {
  try {
    const config = await getOrCreateConfig();
    return NextResponse.json({ data: config });
  } catch (err) {
    console.error('[GET /api/energy/fee-config]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || !canAccessAdminEnergy(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const config = await getOrCreateConfig();

    const updated = await db.feeConfiguration.update({
      where: { id: config.id },
      data: {
        designFeeCentavos: body.designFeeCentavos ?? config.designFeeCentavos,
        installationPct: body.installationPct ?? config.installationPct,
        permitFeeCentavos: body.permitFeeCentavos ?? config.permitFeeCentavos,
        maintenanceAnnualFeeCentavos: body.maintenanceAnnualFeeCentavos ?? config.maintenanceAnnualFeeCentavos,
        depositRequiredPct: body.depositRequiredPct ?? config.depositRequiredPct,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error('[PUT /api/energy/fee-config]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
