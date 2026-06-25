import 'server-only';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessAdminEnergy } from '@/lib/energy-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !canAccessAdminEnergy(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [totalClients, totalLeads, activeProjects, totalInventory, recentLeads] = await Promise.all([
      db.client.count(),
      db.energyLead.count(),
      db.energyProject.count({ where: { status: { in: ['scheduled', 'in_progress'] } } }),
      db.inventoryUnit.count(),
      db.energyLead.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, fullName: true, status: true, customerType: true, createdAt: true },
      }),
    ]);

    return NextResponse.json({ totalClients, totalLeads, activeProjects, totalInventory, recentLeads });
  } catch (err) {
    console.error('[GET /api/dashboard/admin]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
