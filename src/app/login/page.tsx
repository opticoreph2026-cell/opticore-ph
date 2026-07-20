'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Logo } from '@/components/ui/Logo';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { Turnstile } from '@marsidev/react-turnstile';
import { getPostLoginRedirect } from '@/lib/energy-auth';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { ArrowRight, Shield, User } from 'lucide-react';

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

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const hasTurnstile = !!turnstileSiteKey;

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (hasTurnstile && !turnstileToken) {
      error('Please complete the security check before logging in.');
      setLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        email,
        password,
        turnstileToken,
        redirect: false,
      });

      if (result?.error) {
        console.error('[login] signIn error:', result.error, result.status);
        throw new Error('Invalid email or password');
      }

      let role = 'client';
      for (let i = 0; i < 5; i++) {
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();
        if (sessionData?.user?.role) { role = sessionData.user.role; break; }
        await new Promise((r) => setTimeout(r, 300));
      }
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
    if (hasTurnstile && !turnstileToken) {
      error('Please complete the security check before verifying.');
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
        turnstileToken,
        redirect: false,
      });

      if (result?.error) {
        throw new Error('Login failed. Try again.');
      }

      let role = 'client';
      for (let i = 0; i < 5; i++) {
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();
        if (sessionData?.user?.role) { role = sessionData.user.role; break; }
        await new Promise((r) => setTimeout(r, 300));
      }
      router.push(getPostLoginRedirect(role));
      router.refresh();
    } catch (err) {
      error(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-primary-500/10 rounded-full blur-[100px] pointer-events-none translate-x-1/2" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center">
        <Logo className="mb-6 h-12" />
        <p className="text-center text-sm text-foreground-600">Sign in to your portal</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-background-100/60 backdrop-blur-md py-8 px-4 shadow-2xl border border-foreground-950/10 sm:rounded-2xl sm:px-10">
          {showOtpInput ? (
            <div className="space-y-6">
              <p className="text-sm text-foreground-700 text-center">
                Enter the 6-digit code sent to <strong className="text-foreground-950">{email}</strong>
              </p>

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-foreground-700">
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
                  className="mt-1 appearance-none block w-full px-3 py-2.5 text-center text-2xl tracking-[0.5em] border border-foreground-950/10 rounded-lg bg-background-100/40 text-foreground-950 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  placeholder="000000"
                />
              </div>

              {hasTurnstile && (
                <div className="flex justify-center">
                  <Turnstile
                    siteKey={turnstileSiteKey!}
                    onSuccess={(token) => setTurnstileToken(token)}
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={loading || otpCode.length !== 6}
                className="w-full flex justify-center py-2.5 px-4 rounded-xl text-sm font-medium bg-primary-500 text-background-50 hover:bg-primary-600 disabled:opacity-50 transition-colors cta-primary"
              >
                {loading ? <Spinner className="w-5 h-5" /> : 'Verify & Sign In'}
              </button>

              <div className="flex justify-between text-xs">
                <button
                  type="button"
                  onClick={() => { setShowOtpInput(false); setOtpSent(false); setOtpCode(''); }}
                  className="text-foreground-500 hover:text-foreground-950 transition-colors"
                >
                  Back to login
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-primary-500 hover:text-primary-600 transition-colors"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleCredentialsLogin}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 appearance-none block w-full px-3 py-2.5 border border-foreground-950/10 rounded-lg bg-background-100/40 text-foreground-950 focus:outline-none focus:ring-2 focus:ring-primary-500/50 placeholder:text-foreground-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-foreground-700">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs text-primary-500 hover:text-primary-600 transition-colors">
                    Forgot?
                  </Link>
                </div>
                <PasswordInput
                  id="password"
                  label=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              {hasTurnstile && (
                <div className="flex justify-center">
                  <Turnstile
                    siteKey={turnstileSiteKey!}
                    onSuccess={(token) => setTurnstileToken(token)}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 rounded-xl text-sm font-medium bg-primary-500 text-background-50 hover:bg-primary-600 disabled:opacity-50 transition-colors cta-primary"
              >
                {loading ? <Spinner className="w-5 h-5" /> : 'Log in'}
              </button>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full py-2.5 text-sm text-foreground-600 hover:text-foreground-950 border border-foreground-950/10 rounded-xl transition-colors hover:bg-background-100"
              >
                {otpSent ? 'Resend OTP' : 'Send OTP instead'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-foreground-500">
            No account yet?{' '}
            <Link href="/signup" className="font-medium text-primary-500 hover:text-primary-600 transition-colors">
              Sign up here
            </Link>
          </p>
        </div>

        {/* Portal access cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/customer"
            className="bento-card flex items-center gap-3 hover:bg-background-100/60 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground-950 group-hover:text-primary-500 transition-colors">Customer Portal</p>
              <p className="text-xs text-foreground-500">View your system data and bills</p>
            </div>
            <ArrowRight className="w-4 h-4 text-foreground-400 ml-auto group-hover:text-primary-500 transition-colors" />
          </Link>
          <Link
            href="/partner"
            className="bento-card flex items-center gap-3 hover:bg-background-100/60 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-accent-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground-950 group-hover:text-accent-500 transition-colors">Partner Portal</p>
              <p className="text-xs text-foreground-500">Manage leads and installations</p>
            </div>
            <ArrowRight className="w-4 h-4 text-foreground-400 ml-auto group-hover:text-accent-500 transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
