import 'server-only';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { isOptcoreStaff, isPartnerAdmin, isPartnerInstaller } from '@/lib/energy-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function canAccessNotifications(session: any): boolean {
  return isOptcoreStaff(session) || isPartnerAdmin(session) || isPartnerInstaller(session);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !canAccessNotifications(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    // Ensure the user can only mutate notifications scoped to their org (or global)
    const existing = await db.adminNotification.findUnique({ where: { id }, select: { organizationId: true } });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (
      existing.organizationId &&
      session.organizationId &&
      existing.organizationId !== session.organizationId &&
      !isOptcoreStaff(session)
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const notification = await db.adminNotification.update({
      where: { id },
      data: { isRead: body.isRead ?? true },
    });

    return NextResponse.json({ data: notification });
  } catch (err) {
    console.error('[PATCH /api/notifications/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !canAccessNotifications(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    // Ensure the user can only delete notifications scoped to their org (or global)
    const existing = await db.adminNotification.findUnique({ where: { id }, select: { organizationId: true } });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (
      existing.organizationId &&
      session.organizationId &&
      existing.organizationId !== session.organizationId &&
      !isOptcoreStaff(session)
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.adminNotification.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/notifications/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
