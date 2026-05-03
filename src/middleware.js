/**
 * @file src/middleware.js
 * @description Route protection middleware using Access/Refresh token architecture.
 *
 * Cookies:
 *   access_token  (15m)
 *   refresh_token (7d)
 */

import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const ACCESS_COOKIE  = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

function getRefreshSecret() {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  return new TextEncoder().encode(secret);
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
  // Skip refresh redirect if we are already on login, signup, or the refresh endpoint to avoid loops
  const isAuthRoute = pathname.startsWith('/api/auth') || pathname === '/login' || pathname === '/signup';
  const isApiRoute  = pathname.startsWith('/api');
  
  if (!user && refreshToken && !isAuthRoute && !isApiRoute) {
    try {
      const { payload: refreshPayload } = await jwtVerify(refreshToken, getRefreshSecret(), {
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

  // 5. Force onboarding if not complete
  if (pathname.startsWith('/dashboard') && user && user.onboarding_complete === false) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  // 6. Admin specific protection
  if (pathname.startsWith('/admin') && user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 7. Block suspended accounts
  if (user?.suspended && !isAuthRoute && pathname !== '/') {
    const response = NextResponse.redirect(new URL('/login?error=AccountSuspended', request.url));
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (local public images)
     */
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
};
