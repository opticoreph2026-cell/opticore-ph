import 'server-only';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessCrm } from '@/lib/energy-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !canAccessCrm(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const lead = await db.energyLead.findUnique({
      where: { id },
      include: {
        utilityCompany: true,
        assignedOrg: true,
        customers: true,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ data: lead });
  } catch (err) {
    console.error('[GET /api/energy/leads/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !canAccessCrm(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const existing = await db.energyLead.findUnique({
      where: { id },
      select: { status: true, assignedOrgId: true, notes: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const lead = await db.energyLead.update({
      where: { id },
      data: body,
    });

    const activityPromises: Promise<any>[] = [];

    if (body.status && body.status !== existing.status) {
      activityPromises.push(
        db.activityLog.create({
          data: {
            relatedToType: 'lead',
            relatedToId: id,
            action: 'status_changed',
            description: `Status changed from "${existing.status}" to "${body.status}"`,
            actorId: (session as any)?.id ?? null,
          },
        })
      );
    }

    if ('assignedOrgId' in body && body.assignedOrgId !== existing.assignedOrgId) {
      activityPromises.push(
        db.activityLog.create({
          data: {
            relatedToType: 'lead',
            relatedToId: id,
            action: 'assigned',
            description: body.assignedOrgId
              ? `Lead assigned to organization ${body.assignedOrgId}`
              : 'Lead unassigned',
            actorId: (session as any)?.id ?? null,
          },
        })
      );
      activityPromises.push(
        db.adminNotification.create({
          data: {
            type: 'lead',
            title: 'Lead Assigned',
            message: body.assignedOrgId ? 'A lead has been assigned to your organization' : 'Lead unassigned',
            meta: JSON.stringify({ href: `/partner/leads/${id}` }),
          },
        })
      );
    }

    await Promise.allSettled(activityPromises);

    return NextResponse.json({ data: lead });
  } catch (err) {
    console.error('[PATCH /api/energy/leads/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !canAccessCrm(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    await db.energyLead.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/energy/leads/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
