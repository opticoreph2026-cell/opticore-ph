import 'server-only';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessAdminEnergy } from '@/lib/energy-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const packages = await db.packageBundle.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ data: packages });
  } catch (err) {
    console.error('[GET /api/energy/packages]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !canAccessAdminEnergy(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name, description, category, status,
      panelSku, panelQuantity, inverterSku, inverterQuantity,
      batterySku, batteryQuantity,
      totalHardwareCentavos, installationFeeCentavos, designFeeCentavos,
      permitFeeCentavos, grandTotalCentavos, monthlyPaymentEstimateCentavos,
    } = body;

    if (!name || !panelSku || !inverterSku || !batterySku) {
      return NextResponse.json({ error: 'name, panelSku, inverterSku, batterySku are required' }, { status: 422 });
    }

    const pkg = await db.packageBundle.create({
      data: {
        name, description: description || null,
        category: category || 'standard', status: status || 'active',
        panelSku, panelQuantity: panelQuantity || 1,
        inverterSku, inverterQuantity: inverterQuantity || 1,
        batterySku, batteryQuantity: batteryQuantity || 1,
        totalHardwareCentavos: totalHardwareCentavos || 0,
        installationFeeCentavos: installationFeeCentavos || 0,
        designFeeCentavos: designFeeCentavos || 0,
        permitFeeCentavos: permitFeeCentavos || 0,
        grandTotalCentavos: grandTotalCentavos || 0,
        monthlyPaymentEstimateCentavos: monthlyPaymentEstimateCentavos || null,
      },
    });

    return NextResponse.json({ data: pkg }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/energy/packages]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
