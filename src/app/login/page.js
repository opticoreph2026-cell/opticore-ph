'use client';

import Image from 'next/image';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Zap, Eye, EyeOff, CircleAlert, ArrowRight } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import { signIn } from 'next-auth/react';

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const from         = searchParams.get('from') ?? '/dashboard';

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // Handle URL errors (e.g. from NextAuth)
  useEffect(() => {
    const errCode = searchParams.get('error');
    if (errCode === 'OAuthSignIn') setError('Could not sign in with Google. Please try again.');
    else if (errCode === 'OAuthCallback') setError('Authentication failed. Please try again.');
    else if (errCode === 'SessionExpired') setError('Your session has expired. Please sign in again.');
    else if (errCode === 'AccountNotFound') setError('No OptiCore account found with that email.');
    else if (errCode === 'SyncError') setError('Database synchronization failed. Please try again later.');
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Login failed. Please try again.'); return; }
      router.push(data.role === 'admin' ? '/admin' : from);
      router.refresh();
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col relative overflow-hidden">
      {/* Background layers */}
      <div className="fixed inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-radial pointer-events-none" />
      <div className="fixed top-1/3 left-1/4 w-80 h-80 rounded-full bg-brand-500/4 blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-blue-500/4 blur-3xl pointer-events-none" />

      {/* Top nav */}
      <div className="relative z-10 p-6">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:shadow-amber-md"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.05) 100%)',
              border: '1px solid rgba(245,158,11,0.28)',
            }}
          >
            <Zap className="w-4 h-4 text-brand-400" />
          </div>
          <span className="font-bold text-sm">
            <span className="shimmer-text">OptiCore</span>
            <span className="text-text-muted ml-0.5">PH</span>
          </span>
        </Link>
      </div>

      {/* Main card */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 animate-fade-up">
        <div className="w-full max-w-md">
          {/* Card */}
          <div
            className="rounded-3xl p-8"
            style={{
              background: 'rgba(16,16,24,0.9)',
              backdropFilter: 'blur(24px) saturate(160%)',
              WebkitBackdropFilter: 'blur(24px) saturate(160%)',
              border: '1px solid rgba(255,255,255,0.065)',
              boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset, 0 32px 80px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-text-primary mb-1.5 tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-text-muted">
                Sign in to your OptiCore PH account
              </p>
            </div>

            {/* Error state */}
            {error && (
              <div
                className="flex items-start gap-3 px-4 py-3 rounded-xl mb-5"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <CircleAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Google SSO */}
            <div className="space-y-3 mb-5">
              <button
                onClick={() => signIn('google')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-text-primary transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              >
                <Image
                  src="https://authjs.dev/img/providers/google.svg"
                  alt="Google"
                  width={18}
                  height={18}
                />
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <span className="text-[10px] font-black text-text-faint uppercase tracking-[0.18em]">or email</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>
            </div>

            {/* Email/Password form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.16em] mb-2" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.16em]" htmlFor="password">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[10px] font-bold text-brand-400 hover:text-brand-300 hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    className="input-field pr-11"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-muted transition-colors"
                    onClick={() => setShowPw(p => !p)}
                    aria-label="Toggle password visibility"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed mt-1 flex items-center gap-2"
              >
                {loading ? <Spinner size="sm" /> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            {/* Footer links */}
            <p className="mt-6 text-center text-xs text-text-muted">
              Don&apos;t have an account?{' '}
              <Link href="/pricing" className="text-brand-400 hover:underline font-bold">
                Get started free
              </Link>
            </p>

            <p className="mt-4 text-center text-[10px] text-text-faint leading-relaxed">
              By signing in, you acknowledge our{' '}
              <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
              {' '}and consent to data processing under the Philippine Data Privacy Act of 2012.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-950" />}>
      <LoginForm />
    </Suspense>
  );
}
