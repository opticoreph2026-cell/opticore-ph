import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Cookie names must match exactly what auth.js sets
const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

// Get secret from environment
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-for-dev');

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /dashboard and /api/dashboard routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/dashboard')) {
    const token = request.cookies.get(ACCESS_COOKIE)?.value;

    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verify JWT — must match issuer set in auth.js signAccessToken()
      await jwtVerify(token, secret, { issuer: 'opticore-ph' });
      return NextResponse.next();
    } catch (error) {
      // Token is invalid or expired
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      // Clear cookies and redirect
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete(ACCESS_COOKIE);
      response.cookies.delete(REFRESH_COOKIE);
      return response;
    }
  }

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    const token = request.cookies.get(ACCESS_COOKIE)?.value;
    if (token) {
      try {
        await jwtVerify(token, secret, { issuer: 'opticore-ph' });
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch {
        // Token invalid — allow through to login/signup
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/dashboard/:path*',
    '/login',
    '/signup'
  ],
};
