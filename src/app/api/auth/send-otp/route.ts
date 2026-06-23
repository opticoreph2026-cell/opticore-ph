import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendOTPEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const client = await db.client.findUnique({ where: { email } });
    if (!client) {
      return NextResponse.json(
        { exists: false, error: 'No account found with this email. Please sign up first.' },
        { status: 404 },
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.client.update({
      where: { id: client.id },
      data: { otpCode: otp, otpExpiresAt },
    });

    await sendOTPEmail({ email, otp });

    return NextResponse.json({ exists: true, message: 'OTP sent to your email' });
  } catch (err) {
    console.error('[POST /api/auth/send-otp]', err);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
