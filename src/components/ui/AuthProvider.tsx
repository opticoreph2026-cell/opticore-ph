'use client';

import { SessionProvider, signOut, useSession } from 'next-auth/react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export function useAuth() {
  const { data: session, status } = useSession();

  const user = session?.user
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
