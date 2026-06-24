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
    <div className="min-h-screen bg-surface-1000 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-accent-cyan/10 rounded-full blur-[100px] pointer-events-none translate-x-1/2" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center">
        <Logo className="mb-6 h-12" />
        <h2 className="text-center text-3xl font-display font-bold text-white tracking-tight">
          Forgot Password
        </h2>
        <p className="mt-2 text-center text-sm text-white/60">Enter your email to receive a reset link</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-surface-900/80 backdrop-blur-md py-8 px-4 shadow-2xl border border-border-subtle sm:rounded-2xl sm:px-10">
          {sent ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-accent-emerald/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white/80 text-sm mb-6">
                If an account exists for <strong className="text-white">{email}</strong>, a password reset link has been sent. Please check your email.
              </p>
              <Link
                href="/login"
                className="text-sm text-accent-cyan hover:text-accent-cyan/80 transition-colors font-medium"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                  className="mt-1 appearance-none block w-full px-3 py-2.5 border border-border-subtle rounded-lg bg-surface-800 text-white focus:outline-none focus:ring-2 focus:ring-accent-amber"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-accent-amber to-accent-cyan hover:opacity-90 disabled:opacity-50"
              >
                {loading ? <Spinner className="w-5 h-5 text-white" /> : 'Send Reset Link'}
              </button>

              <p className="text-center text-xs text-white/40">
                Remember your password?{' '}
                <Link href="/login" className="font-medium text-accent-cyan hover:text-accent-cyan/80 transition-colors">
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
