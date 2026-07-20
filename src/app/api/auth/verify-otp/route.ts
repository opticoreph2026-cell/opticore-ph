import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyOtpSchema } from '@/lib/validations';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
    const throttled = rateLimit(`verify:${ip}`, 5, 60_000);
    if (!throttled.allowed) {
      return NextResponse.json({ error: 'Too many attempts. Please wait before trying again.' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = verifyOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const { email, otp } = parsed.data;

    const client = await db.client.findUnique({ where: { email } });
    if (!client) {
      // Generic error to prevent email enumeration
      return NextResponse.json({ error: 'Invalid or expired OTP. Request a new one.' }, { status: 400 });
    }

    if (!client.otpCode || !client.otpExpiresAt) {
      return NextResponse.json({ error: 'Invalid or expired OTP. Request a new one.' }, { status: 400 });
    }

    if (client.otpCode !== otp) {
      return NextResponse.json({ error: 'Invalid or expired OTP. Request a new one.' }, { status: 400 });
    }

    if (new Date() > client.otpExpiresAt) {
      await db.client.update({ where: { id: client.id }, data: { otpCode: null, otpExpiresAt: null } });
      return NextResponse.json({ error: 'Invalid or expired OTP. Request a new one.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, email: client.email });
  } catch (err) {
    console.error('[POST /api/auth/verify-otp]', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
