import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { hashPassword, signAccessToken, signRefreshToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, turnstileToken } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Turnstile Verification
    if (process.env.TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        return NextResponse.json({ error: 'Security verification required' }, { status: 400 });
      }
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${turnstileToken}`,
      });
      const outcome = await verifyRes.json();
      if (!outcome.success) {
        return NextResponse.json({ error: 'Security check failed' }, { status: 403 });
      }
    }

    // Check existing
    const existing = await db.client.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const hashed = await hashPassword(password);

    // Create user
    const client = await db.client.create({
      data: {
        email,
        name,
        passwordHash: hashed,
        role: 'client',
      }
    });

    // Create AuthProvider link
    await db.authProvider.create({
      data: {
        clientId: client.id,
        provider: 'PASSWORD',
        providerId: client.email,
        email: client.email,
        emailVerified: false,
      }
    });

    // Login user immediately
    const payload = {
      sub: client.id,
      email: client.email,
      name: client.name,
      role: client.role,
      plan: client.planTier,
      onboarding_complete: client.onboardingComplete,
      suspended: client.suspended,
    };

    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken({ sub: client.id });

    // Persist refresh token
    await db.refreshToken.create({
      data: {
        token: refreshToken,
        clientId: client.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      }
    }).catch(() => {});

    // ── Set cookies directly on NextResponse ─────────────────────────────────
    const isProduction = process.env.NODE_ENV === 'production';
    const response = NextResponse.json({ user: payload });

    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 15 * 60,
      path: '/',
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
