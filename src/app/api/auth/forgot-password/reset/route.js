import { NextResponse } from 'next/server';
import { getVerificationToken, deleteVerificationTokens, updateClientPasswordByEmail } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, otp, password } = await request.json();

    if (!email || !otp || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();

    // 1. Verify OTP
    const tokenRecord = await getVerificationToken(normalizedEmail, otp);

    if (!tokenRecord) {
      return NextResponse.json({ error: 'Invalid or expired recovery code.' }, { status: 400 });
    }

    // 2. Check expiry
    if (new Date() > new Date(tokenRecord.expires)) {
      await deleteVerificationTokens(normalizedEmail);
      return NextResponse.json({ error: 'Recovery code has expired.' }, { status: 400 });
    }

    // 3. Hash and Update Password
    const passwordHash = await hashPassword(password);

    await updateClientPasswordByEmail(normalizedEmail, passwordHash);

    // 4. Cleanup tokens
    await deleteVerificationTokens(normalizedEmail);

    return NextResponse.json({ success: true, message: 'Password reset successful. You can now log in.' });

  } catch (error) {
    console.error('Forgot Password Reset Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
