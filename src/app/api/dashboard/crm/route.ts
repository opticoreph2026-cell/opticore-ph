import 'server-only';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessCrm } from '@/lib/energy-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !canAccessCrm(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [newLeads, qualified, quoteSent, activeProjects, commissioned, recentLeads] = await Promise.all([
      db.energyLead.count({ where: { status: 'new' } }),
      db.energyLead.count({ where: { status: 'qualified' } }),
      db.energyLead.count({ where: { status: 'quote_sent' } }),
      db.energyProject.count({ where: { status: { in: ['scheduled', 'in_progress'] } } }),
      db.energyProject.count({ where: { status: 'commissioned' } }),
      db.energyLead.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, fullName: true, city: true, status: true, createdAt: true, customerType: true },
      }),
    ]);

    return NextResponse.json({ newLeads, qualified, quoteSent, activeProjects, commissioned, recentLeads });
  } catch (err) {
    console.error('[GET /api/dashboard/crm]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
