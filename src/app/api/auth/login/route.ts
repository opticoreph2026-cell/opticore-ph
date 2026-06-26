import { NextResponse } from 'next/server';
import { signIn } from '@/auth';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(256),
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
    const throttled = rateLimit(`login:${ip}`, 5, 60_000);
    if (!throttled.allowed) {
      return NextResponse.json({ error: 'Too many attempts. Please wait before trying again.' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email or password format' }, { status: 422 });
    }

    const { email, password } = parsed.data;

    const result = await signIn('credentials', { email, password, redirect: false });

    if (!result || result.error) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('opticore_session', '1', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 604800, // 7 days
    });
    return response;
  } catch (err) {
    console.error('[POST /api/auth/login]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
