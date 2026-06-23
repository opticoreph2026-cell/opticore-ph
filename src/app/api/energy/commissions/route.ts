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
    const payeeOrgId = searchParams.get('payeeOrgId');
    const status = searchParams.get('status');

    const where: any = {};
    if (payeeOrgId) where.payeeOrgId = payeeOrgId;
    if (status) where.status = status;

    const commissions = await db.commissionRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        payeeOrg: { select: { name: true } },
        project: { select: { id: true, status: true, targetInstallDate: true } },
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
      payeeOrgId,
      commissionType,
      amountCentavos,
      status,
      paidAt,
      notes,
    } = body;

    if (!projectId || !payeeOrgId || !amountCentavos) {
      return NextResponse.json({ error: 'projectId, payeeOrgId, and amountCentavos are required' }, { status: 400 });
    }

    const commission = await db.commissionRecord.create({
      data: {
        projectId,
        payeeOrgId,
        commissionType: commissionType || 'hardware_margin',
        amountCentavos,
        status: status || 'pending',
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
