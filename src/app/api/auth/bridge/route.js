import { signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/bridge
 * 
 * Intermediary route to synchronize social login (NextAuth) 
 * with our custom security cookie system.
 */
export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.redirect(new URL('/login?error=SessionExpired', request.url));
  }

  const email = session.user.email?.toLowerCase();
  if (!email) {
    return NextResponse.redirect(new URL('/login?error=SessionExpired', request.url));
  }

  try {
    const client = await db.client.findUnique({
      where: { email },
    });

    if (!client) {
      return NextResponse.redirect(new URL('/login?error=AccountNotFound', request.url));
    }

    // Record login timestamp
    const { recordLogin } = await import('@/lib/db');
    await recordLogin(client.id);

    // ─── LOGIN & REDIRECT ──────────────────────────────────────────────────────
    // Immediately sign the internal Optics Core Token using jose Web Crypto API
    const payload = {
      sub: client.id,
      email: client.email,
      role: client.role,
      plan: client.planTier,
      onboarding_complete: client.onboardingComplete ?? false,
    };

    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken({ sub: client.id });

    await setAuthCookies(client, accessToken, refreshToken);

    // Completely bypass OTP, since Google already authenticated them!
    return NextResponse.redirect(new URL('/dashboard', request.url));

  } catch {
    return NextResponse.redirect(new URL('/login?error=SyncError', request.url));
  }
}
