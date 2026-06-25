import 'server-only';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessPartnerPortal } from '@/lib/energy-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !canAccessPartnerPortal(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = session.organizationId;
    const projects = await db.energyProject.findMany({
      where: orgId ? { organizationId: orgId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        contract: {
          select: {
            quotation: {
              select: { customer: { select: { fullName: true } } },
            },
          },
        },
        milestones: {
          select: { milestone: true, milestoneDate: true },
          orderBy: { milestoneDate: 'desc' },
          take: 3,
        },
      },
    });

    const activeCount = projects.filter((p: any) => ['scheduled', 'in_progress'].includes(p.status)).length;
    const completedCount = projects.filter((p: any) => p.status === 'commissioned' || p.status === 'warranty_registered').length;
    const scheduledCount = projects.filter((p: any) => p.status === 'scheduled').length;

    return NextResponse.json({ activeCount, completedCount, scheduledCount, projects });
  } catch (err) {
    console.error('[GET /api/dashboard/partner]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
