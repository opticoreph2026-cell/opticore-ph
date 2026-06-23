import 'server-only';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessCrm } from '@/lib/energy-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !canAccessCrm(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const activities = await db.activityLog.findMany({
      where: { relatedToType: 'lead', relatedToId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: activities });
  } catch (err) {
    console.error('[GET /api/energy/leads/[id]/activity]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
