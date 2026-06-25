import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resetPasswordSchema } from '@/lib/validations';
import { rateLimit } from '@/lib/rate-limit';
import { hashPassword } from '@/lib/password';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
    const throttled = rateLimit(`reset:${ip}`, 3, 60_000);
    if (!throttled.allowed) {
      return NextResponse.json({ error: 'Too many attempts. Please wait before trying again.' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const { token, password } = parsed.data;

    const client = await db.client.findUnique({
      where: { resetToken: token },
      select: { id: true, resetTokenExpiresAt: true },
    });

    if (!client) {
      return NextResponse.json({ error: 'Invalid or expired reset token.' }, { status: 400 });
    }

    if (!client.resetTokenExpiresAt || new Date() > client.resetTokenExpiresAt) {
      return NextResponse.json({ error: 'Reset token has expired. Please request a new one.' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    await db.client.update({
      where: { id: client.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    });

    return NextResponse.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('[POST /api/auth/reset-password]', err);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
