'use client';

import { SessionProvider } from 'next-auth/react';

/**
 * Client wrapper that provides NextAuth SessionProvider.
 * Required for signIn('google') to work on client components.
 */
export default function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
