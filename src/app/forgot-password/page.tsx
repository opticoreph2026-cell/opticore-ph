'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { error, success } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.email?.[0] || data.error || 'Something went wrong');
      }

      setSent(true);
      success('If an account exists, a reset link has been sent to your email.');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-primary-500/10 rounded-full blur-[100px] pointer-events-none translate-x-1/2" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center">
        <Logo className="mb-6 h-12" />
        <h2 className="text-center text-3xl font-display font-bold text-foreground-950 dark:text-white tracking-tight">
          Forgot Password
        </h2>
        <p className="mt-2 text-center text-sm text-foreground-500 dark:text-white/60">Enter your email to receive a reset link</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-background-100/60 dark:bg-background-800/80 backdrop-blur-md py-8 px-4 shadow-2xl border border-foreground-950/10 dark:border-white/10 sm:rounded-2xl sm:px-10">
          {sent ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-secondary-500/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-foreground-700 dark:text-white/80 text-sm mb-6">
                If an account exists for <strong className="text-foreground-950 dark:text-white">{email}</strong>, a password reset link has been sent. Please check your email.
              </p>
              <Link
                href="/login"
                className="text-sm text-accent-500 hover:text-accent-600 transition-colors font-medium"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground-700 dark:text-white/80">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 appearance-none block w-full px-3 py-2.5 border border-foreground-950/10 dark:border-white/10 rounded-lg bg-background-100 dark:bg-background-800 text-foreground-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-medium text-background-50 bg-gradient-to-r from-primary-500 to-accent-500 hover:opacity-90 disabled:opacity-50"
              >
                {loading ? <Spinner className="w-5 h-5 text-background-50" /> : 'Send Reset Link'}
              </button>

              <p className="text-center text-xs text-foreground-400 dark:text-white/40">
                Remember your password?{' '}
                <Link href="/login" className="font-medium text-accent-500 hover:text-accent-600 transition-colors">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
