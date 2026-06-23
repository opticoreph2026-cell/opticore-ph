import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import { forgotPasswordSchema } from '@/lib/validations';
import { rateLimit } from '@/lib/rate-limit';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
    const throttled = rateLimit(`forgot:${ip}`, 2, 60_000);
    if (!throttled.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait before trying again.' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const { email } = parsed.data;

    const client = await db.client.findUnique({
      where: { email },
      select: { id: true, name: true },
    });

    // Always return success to prevent email enumeration
    if (!client) {
      return NextResponse.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomUUID();
    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.client.update({
      where: { id: client.id },
      data: { resetToken, resetTokenExpiresAt },
    });

    const resetUrl = `${new URL(request.url).origin}/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail({
      name: client.name ?? 'there',
      email,
      resetUrl,
    });

    return NextResponse.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
  } catch (err) {
    console.error('[POST /api/auth/forgot-password]', err);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
