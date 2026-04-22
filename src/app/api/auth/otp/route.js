import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import {
  createVerificationToken,
  deleteVerificationTokenById,
  deleteVerificationTokens,
  getClientByEmail,
  getVerificationToken,
  updateClientPasswordById,
} from '@/lib/db';
import { sendOTPEmail, sendWelcomeEmail } from '@/lib/email';
import { signToken, hashPassword } from '@/lib/auth';

/**
 * GET /api/auth/otp
 * Generates and sends a new 6-digit OTP to the user's Google email.
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user.email?.toLowerCase();
    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in DB (clean up old ones first)
    await deleteVerificationTokens(email);
    const tokenRecord = await createVerificationToken(email, otp, expires);

    // Send Email
    try {
      await sendOTPEmail({ email, otp });
    } catch {
      await deleteVerificationTokenById(tokenRecord.id).catch(async () => {
        await deleteVerificationTokens(email);
      });

      return NextResponse.json({ error: 'Failed to send verification code' }, { status: 503 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[otp] GET Error:', error);
    return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 });
  }
}

/**
 * POST /api/auth/otp
 * Verifies the OTP and completes the user's authentication.
 * For new users, it also sets their "Desired Password".
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { otp, password } = body;
    const email = session.user.email?.toLowerCase();
    const { name } = session.user;

    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Verify OTP
    const tokenRecord = await getVerificationToken(email, otp);
    if (!tokenRecord) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    if (new Date() > tokenRecord.expires) {
      return NextResponse.json({ error: 'Verification code expired. Please request a new one.' }, { status: 410 });
    }

    // 2. Clear tokens
    await deleteVerificationTokens(email);

    // 3. Find User
    const client = await getClientByEmail(email);

    if (!client) {
      return NextResponse.json({ error: 'User not found in bridge registration.' }, { status: 404 });
    }

    const isNewUser = client.passwordHash?.startsWith('GOOGLE_OAUTH_USER_');

    // 4. Set Password (if provided and user is new)
    if (isNewUser && password) {
      if (password.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
      }
      
      const newHash = await hashPassword(password);
      await updateClientPasswordById(client.id, newHash);

      // Send Welcome Email if new
      void sendWelcomeEmail({ name: client.name || name, email: client.email }).catch(() => {});
    }

    // 5. Issue Final Auth Cookie (opticore_auth)
    const token = await signToken({
      sub: client.id,
      email: client.email,
      name: client.name,
      role: client.role || 'client',
      onboarding_complete: client.onboardingComplete ?? false,
    });

    const response = NextResponse.json({
      success: true,
      redirect: !client.onboardingComplete ? '/onboarding' : (client.role === 'admin' ? '/admin' : '/dashboard')
    });

    response.cookies.set('opticore_auth', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   60 * 60 * 24, // 24 hours
      path:     '/',
    });

    return response;

  } catch (error) {
    console.error('[otp] POST Error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
