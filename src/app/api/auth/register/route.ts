import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, setAuthCookies, signAccessToken, signRefreshToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
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

    await setAuthCookies(client, accessToken, refreshToken);

    return NextResponse.json({ user: payload });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
