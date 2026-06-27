import createMiddleware from 'next-intl/middleware';
import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { authConfig } from './auth.config';

const intlMiddleware = createMiddleware(routing);

const { auth } = NextAuth(authConfig);

const appPrefixes = ['/crm', '/partner', '/customer', '/admin', '/login', '/signup', '/api', '/privacy', '/terms', '/onboarding', '/dashboard'];

export default auth((request) => {
  const { pathname } = request.nextUrl;

  // Public lead submission — no auth required, bypass intl to prevent locale redirect
  if (pathname === '/api/energy/leads' && request.method === 'POST') {
    return NextResponse.next();
  }

  // Strip locale prefix (e.g., /en/login → /login, /fil/crm → /crm)
  // This prevents 404s for locale-prefixed app routes
  const localePattern = new RegExp(`^/(${routing.locales.join('|')})/`);
  const localeMatch = pathname.match(localePattern);
  const strippedPath = localeMatch ? pathname.slice(localeMatch[0].length - 1) : pathname;

  const isAppRoute = appPrefixes.some((p) => strippedPath.startsWith(p));

  if (isAppRoute) {
    if (localeMatch) {
      const url = request.nextUrl.clone();
      url.pathname = strippedPath;
      return NextResponse.redirect(url);
    }
    return;
  }

  return intlMiddleware(request);
});

export const config = {
  matcher: [
    '/((?!_next|.*\\..*).*)',
  ],
};
