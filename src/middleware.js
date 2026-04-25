/**
 * @file src/middleware.js
 * @description Route protection middleware using Access/Refresh token architecture.
 *
 * Cookies:
 *   opticore_access  (15m)
 *   opticore_refresh (7d)
 */

import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const ACCESS_COOKIE  = 'opticore_access';
const REFRESH_COOKIE = 'opticore_refresh';

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  const accessToken  = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  // 1. Try verifying Access Token
  let user = null;
  if (accessToken) {
    try {
      const { payload } = await jwtVerify(accessToken, getSecret(), {
        issuer: 'opticore-ph',
      });
      user = payload;
    } catch {
      // Access token expired or invalid
    }
  }

  // 2. If no valid Access Token but we have a Refresh Token, try to trigger a refresh
  // Skip refresh redirect if we are already on login or signup to avoid loops
  if (!user && refreshToken && pathname !== '/login' && pathname !== '/signup') {
    try {
      const { payload: refreshPayload } = await jwtVerify(refreshToken, getSecret(), {
        issuer: 'opticore-ph',
      });
      
      // Refresh token is valid signature-wise. 
      // Redirect to the internal refresh API which can check the DB (Node.js runtime).
      const refreshUrl = new URL('/api/auth/refresh', request.url);
      refreshUrl.searchParams.set('callbackUrl', pathname);
      
      // We use a redirect here because only a Node.js route can verify the DB record
      // and set the new cookies.
      return NextResponse.redirect(refreshUrl);
    } catch {
      // Refresh token also invalid/expired
    }
  }

  // 3. Redirect authenticated users away from /login and /signup
  if ((pathname === '/login' || pathname === '/signup') && user) {
    const dest = user.role === 'admin'
      ? '/admin'
      : user.onboarding_complete === false
        ? '/onboarding'
        : '/dashboard';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // 4. Protect routes
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/onboarding');

  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Admin specific protection
  if (pathname.startsWith('/admin') && user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
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
