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
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
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

  const handleSendOtp = async () => {
    if (!email) {
      error('Enter your email address first');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          error('No account found with this email. Please sign up first.');
          return;
        }
        throw new Error(data.error || 'Failed to send OTP');
      }

      setOtpSent(true);
      setShowOtpInput(true);
      success('OTP sent! Check your email inbox.');
    } catch (err) {
      error(err instanceof Error ? err.message : 'OTP unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      error('Enter the OTP code from your email');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Invalid OTP');
      }

      const result = await signIn('credentials', {
        email,
        password: otpCode,
        type: 'otp',
        redirect: false,
      });

      if (result?.error) {
        throw new Error('Login failed. Try again.');
      }

      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      const role = sessionData?.user?.role ?? 'client';
      router.push(getPostLoginRedirect(role));
      router.refresh();
    } catch (err) {
      error(err instanceof Error ? err.message : 'Verification failed');
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
          {showOtpInput ? (
            <div className="space-y-6">
              <p className="text-sm text-white/80 text-center">
                Enter the 6-digit code sent to <strong className="text-white">{email}</strong>
              </p>

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-white/80">
                  OTP Code
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="mt-1 appearance-none block w-full px-3 py-2.5 text-center text-2xl tracking-[0.5em] border border-border-subtle rounded-lg bg-surface-800 text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  placeholder="000000"
                />
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={loading || otpCode.length !== 6}
                className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-accent-cyan to-accent-emerald hover:opacity-90 disabled:opacity-50"
              >
                {loading ? <Spinner className="w-5 h-5 text-white" /> : 'Verify & Sign In'}
              </button>

              <div className="flex justify-between text-xs">
                <button
                  type="button"
                  onClick={() => { setShowOtpInput(false); setOtpSent(false); setOtpCode(''); }}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  Back to login
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-accent-cyan hover:text-accent-cyan/80 transition-colors"
                >
                  Resend OTP
                </button>
              </div>
            </div>
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
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-white/80">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors">
                    Forgot?
                  </Link>
                </div>
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

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full py-2.5 text-sm text-white/60 hover:text-white border border-white/10 rounded-lg transition-colors"
              >
                {otpSent ? 'Resend OTP' : 'Send OTP instead'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-white/40">
            No account yet?{' '}
            <Link href="/signup" className="font-medium text-accent-cyan hover:text-accent-cyan/80 transition-colors">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
