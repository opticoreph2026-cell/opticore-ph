'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { Turnstile } from '@marsidev/react-turnstile';
import { PasswordInput } from '@/components/ui/PasswordInput';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnstileFailed, setTurnstileFailed] = useState(false);
  const router = useRouter();
  const { error, success } = useToast();
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const hasTurnstile = !!turnstileSiteKey;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (hasTurnstile && !turnstileToken) {
      error('Please complete the security check before creating an account.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, turnstileToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      success('Account created! Please sign in.');
      router.push('/login');
      return;
    } catch (err: any) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-secondary-500/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/2" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center">
        <Logo className="mb-6 h-12" />
        <h2 className="text-center text-3xl font-display font-bold text-foreground-950 dark:text-white tracking-tight">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-foreground-500 dark:text-white/60">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-accent-500 hover:text-accent-600 transition-colors">
            Log in instead
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-background-100/60 dark:bg-background-800/80 backdrop-blur-md py-8 px-4 shadow-2xl border border-foreground-950/10 dark:border-white/10 sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground-700 dark:text-white/80">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2.5 border border-foreground-950/10 dark:border-white/10 rounded-lg bg-background-100 dark:bg-background-800 text-foreground-950 dark:text-white placeholder:text-foreground-950/40 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground-700 dark:text-white/80">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2.5 border border-foreground-950/10 dark:border-white/10 rounded-lg bg-background-100 dark:bg-background-800 text-foreground-950 dark:text-white placeholder:text-foreground-950/40 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            <PasswordInput
              id="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />

            {hasTurnstile && !turnstileFailed ? (
              <div className="flex justify-center">
                <Turnstile
                  siteKey={turnstileSiteKey!}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onError={() => { console.warn('[signup] Turnstile error'); setTurnstileFailed(true); setTurnstileToken('bypass'); }}
                  onExpire={() => setTurnstileToken('bypass')}
                />
              </div>
            ) : hasTurnstile && turnstileFailed ? (
              <p className="text-xs text-foreground-950/40 text-center py-2">Security check unavailable — you can still submit</p>
            ) : null}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-background-50 bg-gradient-to-r from-primary-500 to-secondary-500 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-100 dark:focus:ring-offset-background-800 focus:ring-primary-500/50 transition-all"
              >
                {loading ? <Spinner className="w-5 h-5 text-background-50" /> : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
