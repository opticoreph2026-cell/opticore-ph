import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { sendWelcomeEmail } from '@/lib/email';
import { registerSchema } from '@/lib/validations';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
    const throttled = rateLimit(`register:${ip}`, 3, 60_000);
    if (!throttled.allowed) {
      return NextResponse.json({ error: 'Too many attempts. Please wait before trying again.' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 422 });
    }

    const { email, password, name, turnstileToken } = parsed.data;
    if (process.env.TURNSTILE_SECRET_KEY) {
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
    const normalizedEmail = email.toLowerCase().trim();

    const client = await db.client.create({
      data: {
        email: normalizedEmail,
        name,
        passwordHash: hashed,
        role: 'customer',
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
