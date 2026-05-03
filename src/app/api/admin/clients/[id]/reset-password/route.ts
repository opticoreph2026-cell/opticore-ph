import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email.js';
import { randomBytes } from 'crypto';

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

  const target = await db.client.findUnique({ where: { id: clientId } });
  if (!target) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  if (target.role === 'admin') {
    return NextResponse.json({ error: 'Cannot reset an admin password this way' }, { status: 400 });
  }

  // Only makes sense for password-based users
  const hasPassword = await db.authProvider.findFirst({
    where: { clientId, provider: 'PASSWORD' },
  });
  if (!hasPassword) {
    return NextResponse.json(
      { error: 'User signed up with Google only — no password to reset.' },
      { status: 400 }
    );
  }

  // Generate reset token (valid 1 hour)
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  // Clear old tokens and create new
  await db.verificationToken.deleteMany({ where: { email: target.email } });
  await db.verificationToken.create({
    data: { email: target.email, token, expires },
  });

  // Audit log
  await db.adminAuditLog.create({
    data: {
      adminId:    admin.id,
      action:     'FORCE_PASSWORD_RESET',
      targetId:   clientId,
      targetType: 'Client',
      metadata:   JSON.stringify({ email: target.email }),
      ipAddress:  req.headers.get('x-forwarded-for') ?? undefined,
    },
  });

  // Send reset email using existing email utility
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://opticoreph.com';
  const resetUrl = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(target.email)}`;

  await sendPasswordResetEmail({
    name: target.name ?? target.email,
    email: target.email,
    resetUrl,
  });

  return NextResponse.json({ ok: true, message: 'Password reset email sent.' });
}
