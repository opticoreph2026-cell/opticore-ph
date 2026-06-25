import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { sendWelcomeEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, turnstileToken } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

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

    const existing = await db.client.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const hashed = await hashPassword(password);

    const client = await db.client.create({
      data: {
        email,
        name,
        passwordHash: hashed,
        role: 'customer',
      },
    });

    await db.authProvider.create({
      data: {
        clientId: client.id,
        provider: 'PASSWORD',
        providerId: client.email,
        email: client.email,
        emailVerified: false,
      },
    });

    try {
      await sendWelcomeEmail({ name: client.name || '', email: client.email });
    } catch (emailErr) {
      console.error('[Register] Welcome email failed:', emailErr);
    }

    return NextResponse.json({
      user: {
        id: client.id,
        email: client.email,
        name: client.name,
        role: client.role,
      },
      message: 'Account created. Please sign in.',
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
