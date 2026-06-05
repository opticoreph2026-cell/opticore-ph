import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, setAuthCookies, signAccessToken, signRefreshToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find client
    const client = await db.client.findUnique({ where: { email } });
    if (!client || !client.passwordHash) {
      // Record failed attempt
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

    await setAuthCookies(client, accessToken, refreshToken);

    // Update last login
    await db.client.update({
      where: { id: client.id },
      data: { lastLoginAt: new Date(), lastSignedInAt: new Date() }
    });

    // Record success
    await db.signInEvent.create({
      data: {
        clientId: client.id,
        provider: 'PASSWORD',
        success: true,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      }
    });

    return NextResponse.json({ user: payload });
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
