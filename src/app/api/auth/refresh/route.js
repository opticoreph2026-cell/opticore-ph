/**
 * POST /api/auth/refresh
 * Validates the refresh token and issues a new Access/Refresh pair.
 * Implements token rotation for maximum security.
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, verifyRefreshToken, signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST() {
  return await handleRefresh();
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  const res = await handleRefresh();
  
  if (res.status === 200) {
    return NextResponse.redirect(new URL(callbackUrl, request.url));
  }
  
  // If refresh fails, determine if we MUST go to login
  const isProtected = callbackUrl.startsWith('/dashboard') || callbackUrl.startsWith('/admin') || callbackUrl.startsWith('/onboarding');
  
  if (isProtected) {
    return NextResponse.redirect(new URL('/login?error=SessionExpired', request.url));
  }

  // For public routes (like /pricing), just go back as guest
  const response = NextResponse.redirect(new URL(callbackUrl, request.url));
  response.cookies.set('opticore_access', '', { maxAge: 0 });
  response.cookies.set('opticore_refresh', '', { maxAge: 0 });
  return response;
}

async function handleRefresh() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('opticore_refresh')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'REFRESH_TOKEN_MISSING' }, { status: 401 });
    }

    // 1. Verify token signature and expiry using the REFRESH secret
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json({ error: 'INVALID_REFRESH_TOKEN' }, { status: 401 });
    }

    // 2. Check DB persistence and revocation status
    const dbToken = await db.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { client: true }
    });

    if (!dbToken || dbToken.expiresAt < new Date()) {
      // If token is found but expired, clean it up
      if (dbToken) {
        await db.refreshToken.delete({ where: { token: refreshToken } }).catch(() => {});
      }
      return NextResponse.json({ error: 'TOKEN_EXPIRED_OR_REVOKED' }, { status: 401 });
    }

    const client = dbToken.client;

    // 3. Prepare new payload (synchronizes with latest DB state like planTier)
    const newPayload = {
      sub:                 client.id,
      email:               client.email,
      name:                client.name,
      role:                client.role ?? 'client',
      plan:                client.planTier ?? 'starter',
      onboarding_complete: client.onboardingComplete ?? false,
    };

    // 4. Generate fresh pair
    const newAccessToken = await signAccessToken(newPayload);
    const newRefreshToken = await signRefreshToken({ sub: client.id });

    // 5. Rotate Refresh Token: Delete old one to prevent reuse
    await db.refreshToken.delete({ where: { token: refreshToken } }).catch(() => {});
    
    // 6. Set Cookies & Persist new refresh token
    await setAuthCookies(client, newAccessToken, newRefreshToken);

    return NextResponse.json({
      success: true,
      plan: client.planTier ?? 'starter',
    }, { status: 200 });

  } catch (error) {
    console.error('[Auth Refresh Engine Error]:', error);
    return NextResponse.json({ error: 'INTERNAL_REFRESH_ERROR' }, { status: 500 });
  }
}
