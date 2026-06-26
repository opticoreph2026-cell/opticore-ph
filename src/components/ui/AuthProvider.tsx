'use client';

import { SessionProvider, signOut, useSession } from 'next-auth/react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

function hasGuardCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split('; ').some((c) => c.startsWith('opticore_session='));
}

export function useAuth() {
  const { data: session, status } = useSession();

  // Require both NextAuth session AND guard cookie to consider user authenticated
  const guardPresent = hasGuardCookie();
  const user = session?.user && guardPresent
    ? {
        sub: session.user.id,
        email: session.user.email ?? '',
        name: session.user.name ?? '',
        role: session.user.role ?? 'client',
      }
    : null;

  return {
    user,
    loading: status === 'loading',
    logout: async () => {
      await signOut({ callbackUrl: '/login' });
    },
    refresh: async () => {},
    login: () => {},
  };
}
