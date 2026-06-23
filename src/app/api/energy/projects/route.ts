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

    const projects = await db.energyProject.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        contract: { select: { quotation: { select: { customer: { select: { fullName: true } } } } } },
        organization: { select: { name: true } },
        leadInstaller: { select: { client: { select: { name: true } } } },
        milestones: { orderBy: { milestoneDate: 'desc' }, take: 5 },
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
      contractId,
      designId,
      organizationId,
      leadInstallerId,
      scheduledInstallDate,
      status,
      milestones,
    } = body;

    if (!contractId || !designId) {
      return NextResponse.json({ error: 'contractId and designId are required' }, { status: 400 });
    }

    const project = await db.energyProject.create({
      data: {
        contractId,
        designId,
        organizationId: organizationId || null,
        leadInstallerId: leadInstallerId || null,
        scheduledInstallDate: scheduledInstallDate ? new Date(scheduledInstallDate) : null,
        status: status || 'scheduled',
      },
    });

    if (milestones && Array.isArray(milestones)) {
      await db.projectMilestone.createMany({
        data: milestones.map((m: { milestone: string; milestoneDate?: string; notes?: string }) => ({
          projectId: project.id,
          milestone: m.milestone,
          milestoneDate: m.milestoneDate ? new Date(m.milestoneDate) : new Date(),
          notes: m.notes || null,
        })),
      });
    }

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/energy/projects]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
