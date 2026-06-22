import createMiddleware from 'next-intl/middleware';
import NextAuth from 'next-auth';
import { routing } from './i18n/routing';
import { authConfig } from './auth.config';

const intlMiddleware = createMiddleware(routing);

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { pathname } = request.nextUrl;

  // Public lead submission — no auth required
  if (pathname === '/api/energy/leads' && request.method === 'POST') {
    return intlMiddleware(request);
  }

  // App routes — auth only, no locale prefix
  const appPrefixes = ['/crm', '/partner', '/customer', '/admin', '/login', '/signup', '/api'];
  const isAppRoute = appPrefixes.some((p) => pathname.startsWith(p));

  if (isAppRoute) {
    return;
  }

  return intlMiddleware(request);
});

export const config = {
  matcher: [
    '/((?!_next|.*\\..*).*)',
  ],
};
