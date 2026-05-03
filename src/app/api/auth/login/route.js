/**
 * POST /api/auth/login
 * Rate-limited login endpoint with bcrypt + legacy SHA-256 support.
 * On successful SHA-256 login, silently upgrades the hash to bcrypt.
 */

import { NextResponse }  from 'next/server';
import { db, getClientByEmail, updateClientPasswordById } from '@/lib/db';
import { signAccessToken, signRefreshToken, setAuthCookies, verifyPassword, hashPassword } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';
import { verifyTurnstileToken } from '@/lib/security';

export async function POST(request) {
  // ── Rate limiting ────────────────────────────────────────────────────────
  const ip = getClientIp(request);
  const rl = checkRateLimit(`login:${ip}`);
  if (!rl.success) {
    return NextResponse.json(
      { error: `Too many login attempts. Try again in ${Math.ceil(rl.retryAfterMs / 60000)} minutes.` },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) },
      }
    );
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { email, password, captchaToken } = body ?? {};

  // ── CAPTCHA Verification ──────────────────────────────────────────────────
  const isHuman = await verifyTurnstileToken(captchaToken, ip);
  if (!isHuman) {
    return NextResponse.json({ error: 'Security check failed. Please refresh and try again.' }, { status: 403 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  if (typeof email !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
  }

  // ── Fetch client from the database ────────────────────────────────────────
  let client;
  try {
    client = await getClientByEmail(email.trim().toLowerCase());
  } catch (error) {
    console.error('[Login API] Database lookup failed:', error);
    return NextResponse.json({ error: 'Service temporarily unavailable.' }, { status: 503 });
  }

  if (!client) {
    // Generic error to prevent email enumeration
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  // ── Verify password ───────────────────────────────────────────────────────
  const storedHash = client.passwordHash ?? '';
  const { valid, needsRehash } = await verifyPassword(password, storedHash);

  if (!valid) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  // ── Silently upgrade legacy SHA-256 → bcrypt ──────────────────────────────
  if (needsRehash) {
    try {
      const newHash = await hashPassword(password);
      await updateClientPasswordById(client.id, newHash);
    } catch {
      // Non-fatal — log in production; do not block login
    }
  }

  // ── Block suspended accounts ─────────────────────────────────────────────
  if (client.suspended) {
    return NextResponse.json({ 
      error: 'Your account has been suspended. Please contact support if you believe this is an error.' 
    }, { status: 403 });
  }

  // ── Issue JWT ─────────────────────────────────────────────────────────────
  const role  = client.role ?? 'client';
  
  try {
    await db.client.update({
      where: { id: client.id },
      data: { 
        lastLoginAt: new Date(),
        lastSignedInAt: new Date(),
      },
    });

    // Log successful sign-in
    await db.signInEvent.create({
      data: {
        clientId: client.id,
        provider: 'PASSWORD',
        ipAddress: ip,
        userAgent: request.headers.get('user-agent'),
        success: true,
      }
    });

    // Ensure AuthProvider(PASSWORD) exists and update lastUsedAt
    const existingProvider = await db.authProvider.findFirst({
      where: { clientId: client.id, provider: 'PASSWORD' }
    });

    if (existingProvider) {
      await db.authProvider.update({
        where: { id: existingProvider.id },
        data: { lastUsedAt: new Date() }
      });
    } else {
      await db.authProvider.create({
        data: {
          clientId: client.id,
          provider: 'PASSWORD',
          providerId: client.id,
          email: client.email,
          emailVerified: !!client.emailVerified
        }
      });
    }
  } catch (e) {
    console.error('[Login API] Auth metadata update failed:', e);
  }

  const payload = {
    sub:                client.id,
    email:              client.email,
    name:               client.name,
    role,
    plan:               client.planTier ?? 'starter',
    avatar:             client.avatar,
    onboarding_complete: client.onboardingComplete ?? false,
    suspended:          client.suspended ?? false,
  };

  const accessToken = await signAccessToken(payload);
  const refreshToken = await signRefreshToken({ sub: client.id });

  await setAuthCookies(client, accessToken, refreshToken);

  return NextResponse.json({ success: true, role }, { status: 200 });
}
