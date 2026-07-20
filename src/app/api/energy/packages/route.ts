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
      select: {
        id: true, name: true, description: true, category: true, status: true,
        panelSku: true, panelQuantity: true,
        inverterSku: true, inverterQuantity: true,
        batterySku: true, batteryQuantity: true,
        totalHardware: true, installationFee: true, designFee: true, permitFee: true,
        grandTotal: true, monthlyPaymentEstimate: true,
        createdAt: true, updatedAt: true,
      },
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
      totalHardware, installationFee, designFee,
      permitFee, grandTotal, monthlyPaymentEstimate,
    } = body;

    if (!name || !panelSku || !inverterSku || !batterySku) {
      return NextResponse.json({ error: 'name, panelSku, inverterSku, batterySku are required' }, { status: 422 });
    }

    const validCategories = ['starter', 'standard', 'premium', 'custom'];
    const validStatuses = ['active', 'inactive'];
    const resolvedCategory = category || 'standard';
    const resolvedStatus = status || 'active';
    if (!validCategories.includes(resolvedCategory)) {
      return NextResponse.json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` }, { status: 422 });
    }
    if (!validStatuses.includes(resolvedStatus)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 422 });
    }

    const pkg = await db.packageBundle.create({
      data: {
        name, description: description || null,
        category: resolvedCategory, status: resolvedStatus,
        panelSku, panelQuantity: panelQuantity || 1,
        inverterSku, inverterQuantity: inverterQuantity || 1,
        batterySku, batteryQuantity: batteryQuantity || 1,
        totalHardware: totalHardware || 0,
        installationFee: installationFee || 0,
        designFee: designFee || 0,
        permitFee: permitFee || 0,
        grandTotal: grandTotal || 0,
        monthlyPaymentEstimate: monthlyPaymentEstimate || null,
      },
    });

    return NextResponse.json({ data: pkg }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/energy/packages]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
