'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Logo } from '@/components/ui/Logo';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { Turnstile } from '@marsidev/react-turnstile';
import { getPostLoginRedirect } from '@/lib/energy-auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const router = useRouter();
  const { error, success } = useToast();

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error('Invalid email or password');
      }

      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      const role = sessionData?.user?.role ?? 'client';
      router.push(getPostLoginRedirect(role));
      router.refresh();
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      error('Enter your email address first');
      return;
    }
    setLoading(true);
    try {
      const result = await signIn('resend', { email, redirect: false });
      if (result?.error) throw new Error('Failed to send magic link');
      setMagicLinkSent(true);
      success('Check your email for a sign-in link');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Magic link unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-1000 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-accent-cyan/10 rounded-full blur-[100px] pointer-events-none translate-x-1/2" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center">
        <Logo className="mb-6 h-12" />
        <h2 className="text-center text-3xl font-display font-bold text-white tracking-tight">
          OptiCore Energy Solutions
        </h2>
        <p className="mt-2 text-center text-sm text-white/60">Sign in to your portal</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-surface-900/80 backdrop-blur-md py-8 px-4 shadow-2xl border border-border-subtle sm:rounded-2xl sm:px-10">
          {magicLinkSent ? (
            <p className="text-center text-accent-emerald">
              Magic link sent! Check your inbox at <strong>{email}</strong>.
            </p>
          ) : (
            <form className="space-y-6" onSubmit={handleCredentialsLogin}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 appearance-none block w-full px-3 py-2.5 border border-border-subtle rounded-lg bg-surface-800 text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/80">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 appearance-none block w-full px-3 py-2.5 border border-border-subtle rounded-lg bg-surface-800 text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                />
              </div>

              {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                <div className="flex justify-center">
                  <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                    onSuccess={(token) => setTurnstileToken(token)}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-accent-cyan to-accent-emerald hover:opacity-90 disabled:opacity-50"
              >
                {loading ? <Spinner className="w-5 h-5 text-white" /> : 'Log in'}
              </button>

              {process.env.NEXT_PUBLIC_RESEND_ENABLED !== 'false' && (
                <button
                  type="button"
                  onClick={handleMagicLink}
                  disabled={loading}
                  className="w-full py-2.5 text-sm text-white/60 hover:text-white border border-white/10 rounded-lg transition-colors"
                >
                  Send magic link instead
                </button>
              )}
            </form>
          )}

          <p className="mt-6 text-center text-xs text-white/40">
            Client portal? Use the magic link with your registered email.
          </p>
        </div>
      </div>
    </div>
  );
}
