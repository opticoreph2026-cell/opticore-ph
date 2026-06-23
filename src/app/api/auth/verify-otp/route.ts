import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();
    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const client = await db.client.findUnique({ where: { email } });
    if (!client) {
      return NextResponse.json({ error: 'No account found' }, { status: 404 });
    }

    if (!client.otpCode || !client.otpExpiresAt) {
      return NextResponse.json({ error: 'No OTP requested. Request a new one.' }, { status: 400 });
    }

    if (client.otpCode !== otp) {
      return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 });
    }

    if (new Date() > client.otpExpiresAt) {
      return NextResponse.json({ error: 'OTP expired. Request a new one.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, email: client.email });
  } catch (err) {
    console.error('[POST /api/auth/verify-otp]', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
