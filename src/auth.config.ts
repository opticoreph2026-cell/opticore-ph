import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    authorized({ auth, request }) {
      let { pathname } = request.nextUrl;
      // Strip locale prefix for locale-aware protected path matching
      pathname = pathname.replace(/^\/(en|fil)\//, '/');
      const protectedPrefixes = ['/crm', '/partner', '/customer', '/admin'];
      const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
      const isEnergyApi =
        pathname.startsWith('/api/energy') &&
        !(pathname === '/api/energy/leads' && request.method === 'POST');

      if (isProtected || isEnergyApi) {
        return !!auth?.user;
      }
      return true;
    },
  },
  providers: [],
  trustHost: process.env.VERCEL === '1',
} satisfies NextAuthConfig;
