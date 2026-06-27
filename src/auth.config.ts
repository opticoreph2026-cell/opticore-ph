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
      pathname = pathname.replace(/^\/(en|fil)\//, '/');
      const protectedPrefixes = ['/crm', '/partner', '/customer', '/admin', '/dashboard'];
      const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
      const isEnergyApi =
        pathname.startsWith('/api/energy') &&
        !(pathname === '/api/energy/leads' && request.method === 'POST');

      if (isProtected) {
        if (!auth?.user) return false;
        if (pathname !== '/login') {
          const guardCookie = request.cookies.get('opticore_session');
          if (!guardCookie) return false;
        }
        return true;
      }

      if (isEnergyApi) {
        return !!auth?.user;
      }

      return true;
    },
  },
  providers: [],
  trustHost: process.env.VERCEL === '1',
} satisfies NextAuthConfig;
