import { NextRequest, NextResponse } from 'next/server';
import { buildAuthUrl } from '@/lib/oauth/google';
import { randomBytes } from 'crypto';
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  // Rate limit
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(`oauth_init_${ip}`, 10);
  if (!rateLimit.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // Generate CSRF state token
  const state = randomBytes(32).toString('hex');
  
  // Capture optional redirect-after-login destination
  const redirect = req.nextUrl.searchParams.get('redirect') || '/dashboard';
  
  // Combine state + redirect into a single cookie payload
  const statePayload = JSON.stringify({ state, redirect, ts: Date.now() });
  
  const response = NextResponse.redirect(buildAuthUrl(state));
  
  // Store state in httpOnly cookie for CSRF verification
  response.cookies.set('oauth_state', statePayload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',           // MUST be 'lax' for OAuth redirect to work
    maxAge: 60 * 10,           // 10 minutes
    path: '/',
  });
  
  return response;
}
