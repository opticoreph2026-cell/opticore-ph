import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createVerificationToken, deleteVerificationTokenById, deleteVerificationTokens } from '@/lib/db';
import { sendOTPEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if user exists
    const user = await db.client.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      // Security: Don't reveal if user exists. Return 200 anyway.
      return NextResponse.json({ success: true, message: 'If an account exists, a reset code has been sent.' });
    }

    // 2. Clean up old tokens
    await deleteVerificationTokens(user.email);

    // 3. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // 4. Save to DB
    const tokenRecord = await createVerificationToken(user.email, otp, expires);

    // 5. Send Email
    try {
      await sendOTPEmail({ email: user.email, otp });
    } catch {
      await deleteVerificationTokenById(tokenRecord.id).catch(async () => {
        await deleteVerificationTokens(user.email);
      });

      return NextResponse.json(
        { error: 'We could not send the recovery code. Please try again.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true, message: 'Check your email for the recovery code.' });

  } catch (error) {
    console.error('Forgot Password Request Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
