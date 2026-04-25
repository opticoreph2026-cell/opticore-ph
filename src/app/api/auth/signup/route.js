/**
 * POST /api/auth/signup
 *
 * Creates a new client account directly in the database.
 * - Validates inputs
 * - Checks for duplicate email
 * - Hashes password with bcrypt
 * - Creates client record
 * - Issues JWT + sets auth cookie
 * - Sends welcome email via Resend (non-blocking)
 *
 * Body: { name, email, password, electricity_provider_id?, water_provider_id?, consent }
 */

import { NextResponse }    from 'next/server';
import { getClientByEmail, createNewClientRecord } from '@/lib/db';
import { hashPassword, signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';
import { createAdminNotification } from '@/lib/db';


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PW   = 8;

function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function POST(request) {
  // ── Rate limiting (5 signups per IP per 15 min) ───────────────────────────
  const ip = getClientIp(request);
  const rl = checkRateLimit(`signup:${ip}`, 5);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many signup attempts. Please wait and try again.' },
      { status: 429 }
    );
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const {
    name,
    email,
    password,
    consent,
  } = body ?? {};

  // ── Input validation ──────────────────────────────────────────────────────
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json({ error: 'Full name must be at least 2 characters.' }, { status: 400 });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
  }
  if (!password || password.length < MIN_PW) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PW} characters.` },
      { status: 400 }
    );
  }
  if (!consent) {
    return NextResponse.json(
      { error: 'You must consent to data processing to create an account.' },
      { status: 400 }
    );
  }

  // ── Check for duplicate email ─────────────────────────────────────────────
  let existing;
  try {
    existing = await getClientByEmail(email.trim().toLowerCase());
  } catch {
    return NextResponse.json({ error: 'Service temporarily unavailable.' }, { status: 503 });
  }

  if (existing) {
    return NextResponse.json(
      { error: 'An account with this email already exists. Please sign in.' },
      { status: 409 }
    );
  }

  // ── Hash password ─────────────────────────────────────────────────────────
  let passwordHash;
  try {
    passwordHash = await hashPassword(password);
  } catch {
    return NextResponse.json({ error: 'Failed to secure password.' }, { status: 500 });
  }

  // ── Create client in native database ───────────────────────────────────────
  let client;
  try {
    client = await createNewClientRecord({
      name:                    toTitleCase(name.trim()),
      email:                   email.trim().toLowerCase(),
      password_hash:           passwordHash,
    });
  } catch (err) {
    console.error('[signup] Failed to create client:', err?.message);
    return NextResponse.json({ error: 'Failed to create account. Please try again.' }, { status: 500 });
  }

  // ── Issue JWT ─────────────────────────────────────────────────────────────
  const payload = {
    sub:                 client.id,
    email:               client.email,
    name:                client.name,
    role:                'client',
    plan:                client.planTier ?? 'starter',
    onboarding_complete: false,
  };

  const accessToken = await signAccessToken(payload);
  const refreshToken = await signRefreshToken({ sub: client.id });

  await setAuthCookies(client, accessToken, refreshToken);

  // ── Send welcome email + admin notification (non-blocking) ───────────────
  sendWelcomeEmail({ name: name.trim(), email: email.trim().toLowerCase() })
    .catch(() => {});

  createAdminNotification({
    type:    'new_user',
    title:   `New user registered`,
    message: `${toTitleCase(name.trim())} signed up with email/password`,
    meta: { email: email.trim().toLowerCase(), name: toTitleCase(name.trim()), plan: 'starter' },
  }).catch(() => {});

  return NextResponse.json(
    { success: true, redirect: '/onboarding' },
    { status: 201 }
  );
}

