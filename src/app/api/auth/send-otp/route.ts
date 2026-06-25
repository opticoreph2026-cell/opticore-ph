import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendOTPEmail } from '@/lib/email';
import { sendOtpSchema } from '@/lib/validations';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
    const throttled = rateLimit(`otp:${ip}`, 3, 60_000);
    if (!throttled.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait before requesting another OTP.' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = sendOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const { email } = parsed.data;

    const client = await db.client.findUnique({ where: { email } });
    if (!client) {
      // Return generic success to prevent email enumeration
      return NextResponse.json({ success: true, message: 'If an account exists, an OTP has been sent.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.client.update({
      where: { id: client.id },
      data: { otpCode: otp, otpExpiresAt },
    });

    await sendOTPEmail({ email, otp });

    return NextResponse.json({ success: true, message: 'If an account exists, an OTP has been sent.' });
  } catch (err) {
    console.error('[POST /api/auth/send-otp]', err);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
