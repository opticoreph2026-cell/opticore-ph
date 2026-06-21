import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, signAccessToken, signRefreshToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, password, turnstileToken } = await req.json();

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

    // Find client
    const client = await db.client.findUnique({ where: { email } });
    if (!client || !client.passwordHash) {
      if (client) {
        await db.signInEvent.create({
          data: {
            clientId: client.id,
            provider: 'PASSWORD',
            success: false,
            failReason: 'Invalid credentials',
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
          }
        });
      }
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (client.suspended) {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 });
    }

    // Verify password
    const { valid } = await verifyPassword(password, client.passwordHash);

    if (!valid) {
      await db.signInEvent.create({
        data: {
          clientId: client.id,
          provider: 'PASSWORD',
          success: false,
          failReason: 'Invalid credentials',
          ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        }
      });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Success - generate tokens
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

    // Persist refresh token to DB
    try {
      await db.refreshToken.create({
        data: {
          token: refreshToken,
          clientId: client.id,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        }
      });
    } catch (e) {
      console.error('[Login] Failed to persist refresh token:', e);
    }

    // Update last login
    await db.client.update({
      where: { id: client.id },
      data: { lastLoginAt: new Date(), lastSignedInAt: new Date() }
    }).catch(() => {});

    // Record success
    await db.signInEvent.create({
      data: {
        clientId: client.id,
        provider: 'PASSWORD',
        success: true,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      }
    }).catch(() => {});

    // ── Set cookies directly on NextResponse ─────────────────────────────────
    // NOTE: In Next.js 14 Route Handlers, cookies MUST be set on NextResponse.
    // Using cookies().set() from next/headers does NOT work in Route Handlers.
    const isProduction = process.env.NODE_ENV === 'production';
    const response = NextResponse.json({ user: payload });

    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 15 * 60,          // 15 minutes
      path: '/',
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
