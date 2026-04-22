/**
 * @file src/middleware.js
 * @description Route protection middleware using jose JWT verification.
 * Runs at the edge (no Node.js APIs, no Airtable calls).
 *
 * Protected routes:
 *   /dashboard/*   → requires any authenticated user
 *   /admin/*       → requires role === 'admin'
 *   /onboarding    → requires authenticated user
 *
 * Auth routes (/login, /signup) redirect to dashboard if already authenticated.
 * JWT auto-refresh: silently re-issues tokens within 2h of expiry.
 */

import { NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

const COOKIE_NAME = 'opticore_auth';
const TOKEN_EXPIRY = '24h';
const REFRESH_THRESHOLD_SECONDS = 2 * 60 * 60; // Refresh if < 2h remaining

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

/** Re-sign a payload with a fresh 24h expiry */
async function refreshJwt(payload) {
  // Strip jose-internal fields before re-signing
  const { iat, exp, iss, ...claims } = payload;
  return new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .setIssuer('opticore-ph')
    .sign(getSecret());
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // ── Decode token (if any) ─────────────────────────────────────────────────
  let user = null;
  let shouldRefresh = false;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, getSecret(), {
        issuer: 'opticore-ph',
      });
      user = payload;

      // Check if token is nearing expiry — refresh proactively
      if (payload.exp) {
        const secondsRemaining = payload.exp - Math.floor(Date.now() / 1000);
        if (secondsRemaining < REFRESH_THRESHOLD_SECONDS) {
          shouldRefresh = true;
        }
      }
    } catch {
      // Token invalid or expired — treat as unauthenticated
    }
  }

  // ── Redirect authenticated users away from /login and /signup ─────────────
  if ((pathname === '/login' || pathname === '/signup') && user) {
    const dest = user.role === 'admin'
      ? '/admin'
      : user.onboarding_complete === false
        ? '/onboarding'
        : '/dashboard';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // ── Protect /dashboard/* ──────────────────────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Silent JWT refresh — pass through but attach refreshed cookie
    if (shouldRefresh) {
      try {
        const newToken = await refreshJwt(user);
        const response = NextResponse.next();
        response.cookies.set(COOKIE_NAME, newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 24,
          path: '/',
        });
        return response;
      } catch {
        // Non-fatal — just pass through without refresh
      }
    }

    return NextResponse.next();
  }

  // ── Protect /onboarding ───────────────────────────────────────────────────
  if (pathname.startsWith('/onboarding')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // If already completed onboarding, skip to dashboard
    if (user.onboarding_complete === true) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // ── Protect /admin/* ──────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== 'admin') {
      // Authenticated but not admin → redirect to their dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/onboarding/:path*',
    '/login',
    '/signup',
  ],
};
