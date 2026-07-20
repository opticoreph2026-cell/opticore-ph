import 'server-only';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessCrm } from '@/lib/energy-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !canAccessCrm(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (organizationId) where.organizationId = organizationId;
    if (status) where.status = status;

    const commissions = await db.commissionRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, projectId: true, organizationId: true, roleInProject: true,
        amount: true, status: true, paidAt: true, createdAt: true, updatedAt: true,
        organization: { select: { name: true } },
        project: { select: { id: true, status: true, scheduledInstallDate: true } },
      },
    });

    return NextResponse.json({ data: commissions });
  } catch (err) {
    console.error('[GET /api/energy/commissions]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !canAccessCrm(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      projectId,
      organizationId,
      roleInProject,
      amount,
      status,
      paidAt,
      notes,
    } = body;

    if (!projectId || !organizationId || !amount) {
      return NextResponse.json({ error: 'projectId, organizationId, and amount are required' }, { status: 400 });
    }

    const validRoles = ['hardware_margin', 'installation_fee', 'design_fee', 'sub_dealer_markup', 'referral_fee'];
    const validStatuses = ['pending', 'paid'];
    const resolvedRole = roleInProject || 'hardware_margin';
    const resolvedStatus = status || 'pending';
    if (!validRoles.includes(resolvedRole)) {
      return NextResponse.json({ error: `Invalid roleInProject. Must be one of: ${validRoles.join(', ')}` }, { status: 422 });
    }
    if (!validStatuses.includes(resolvedStatus)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 422 });
    }

    const commission = await db.commissionRecord.create({
      data: {
        projectId,
        organizationId,
        roleInProject: resolvedRole,
        amount,
        status: resolvedStatus,
        paidAt: paidAt ? new Date(paidAt) : null,
        notes,
      },
    });

    return NextResponse.json({ data: commission }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/energy/commissions]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
