import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

// Cookie names must match exactly what auth.js sets
const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

// Get secrets from environment
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-for-dev');
const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-for-dev');

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect authenticated routes
  const protectedRoutes = ['/crm', '/partner', '/customer', '/admin', '/api/energy'];
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected) {
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
      // Token is invalid or expired, check for refresh token
      const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
      if (refreshToken) {
        try {
          const { payload } = await jwtVerify(refreshToken, refreshSecret, { issuer: 'opticore-ph' });
          
          // Generate new short-lived access token
          const newAccessToken = await new SignJWT({ ...payload, exp: undefined, iat: undefined })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('15m')
            .setIssuer('opticore-ph')
            .sign(secret);
            
          const response = NextResponse.next();
          response.cookies.set(ACCESS_COOKIE, newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60,
            path: '/',
          });
          return response;
        } catch (refreshError) {
          // Refresh token is also invalid/expired
        }
      }

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
        return NextResponse.redirect(new URL('/crm', request.url));
      } catch {
        // Token invalid — allow through to login/signup
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/crm/:path*',
    '/partner/:path*',
    '/customer/:path*',
    '/admin/:path*',
    '/api/energy/:path*',
    '/login',
    '/signup'
  ],
};
