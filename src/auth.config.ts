import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
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
