'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({
  user: null,
  status: 'loading', // loading | authenticated | unauthenticated
  refresh: () => {},
});

export const useAuth = () => useContext(AuthContext);

/**
 * Custom Auth Provider for OptiCore PH.
 * Replaces NextAuth SessionProvider with a secure, custom JWT session bridge.
 */
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setStatus('authenticated');
      } else {
        setUser(null);
        setStatus('unauthenticated');
      }
    } catch (error) {
      console.error('[AuthContext] Session fetch failed:', error);
      setUser(null);
      setStatus('unauthenticated');
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, refresh: fetchSession }}>
      {children}
    </AuthContext.Provider>
  );
}
