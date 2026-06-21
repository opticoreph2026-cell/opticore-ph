import 'server-only';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { canAccessCrm } from '@/lib/energy-auth';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !canAccessCrm(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const leadInstallerOrgId = searchParams.get('leadInstallerOrgId');

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (leadInstallerOrgId) where.leadInstallerOrgId = leadInstallerOrgId;

    const projects = await db.energyProject.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { fullName: true } },
        leadInstallerOrg: { select: { name: true } },
      },
    });

    return NextResponse.json({ data: projects });
  } catch (err) {
    console.error('[GET /api/energy/projects]', err);
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
      customerId,
      quotationId,
      designId,
      leadInstallerOrgId,
      leadInstallerUserId,
      targetInstallDate,
      status,
      milestones, // JSON string
    } = body;

    if (!customerId || !quotationId || !designId) {
      return NextResponse.json({ error: 'customerId, quotationId, and designId are required' }, { status: 400 });
    }

    const project = await db.energyProject.create({
      data: {
        customerId,
        quotationId,
        designId,
        leadInstallerOrgId,
        leadInstallerUserId,
        targetInstallDate: targetInstallDate ? new Date(targetInstallDate) : null,
        status: status || 'planning',
        milestones: milestones ? JSON.stringify(milestones) : '[]',
      },
    });

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/energy/projects]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
