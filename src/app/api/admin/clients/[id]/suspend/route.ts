import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { sendDiscordAlert } from '@/lib/discord';

export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: clientId } = await params;
  const body = await req.json().catch(() => ({}));
  const { suspend } = body as { suspend?: boolean };

  if (typeof suspend !== 'boolean') {
    return NextResponse.json({ error: 'Missing suspend boolean' }, { status: 400 });
  }

  const target = await db.client.findUnique({ where: { id: clientId } });
  if (!target) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  if (target.role === 'admin') {
    return NextResponse.json({ error: 'Cannot suspend an admin account' }, { status: 400 });
  }

  // Apply suspension
  await db.client.update({
    where: { id: clientId },
    data: { suspended: suspend },
  });

  // If suspending: invalidate all refresh tokens so they can't stay logged in
  if (suspend) {
    await db.refreshToken.deleteMany({ where: { clientId } });
  }

  // Audit log
  await db.adminAuditLog.create({
    data: {
      adminId:    admin.id,
      action:     suspend ? 'SUSPEND_CLIENT' : 'UNSUSPEND_CLIENT',
      targetId:   clientId,
      targetType: 'Client',
      metadata:   JSON.stringify({ email: target.email, name: target.name }),
      ipAddress:  req.headers.get('x-forwarded-for') ?? undefined,
    },
  });

  // Discord alert for suspension only
  if (suspend) {
    sendDiscordAlert(
      `Account suspended by admin **${admin.email}**\nUser: ${target.email}`,
      'warning',
      [{ name: 'Client ID', value: clientId, inline: true }]
    );
  }

  return NextResponse.json({ ok: true, suspended: suspend });
}
