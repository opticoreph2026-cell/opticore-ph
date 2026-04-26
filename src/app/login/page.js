'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, CircleAlert, ArrowRight, Loader2 } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import Logo from '@/components/ui/Logo';
import Captcha from '@/components/ui/Captcha';

// Google icon SVG (official brand mark)
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087C16.6582 14.1327 17.64 11.8636 17.64 9.2045z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.4673-.8064 5.9564-2.1818l-2.9087-2.2582c-.8064.54-1.8382.8591-3.0477.8591-2.3441 0-4.3282-1.5832-5.036-3.7105H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.6818 9c0-.5905.1018-1.1645.2823-1.71V4.9582H.9574A8.9961 8.9961 0 0 0 0 9c0 1.4523.3477 2.8268.9573 4.0418L3.964 10.71z" fill="#FBBC05"/>
      <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z" fill="#EA4335"/>
    </svg>
  );
}

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const from         = searchParams.get('from') ?? '/dashboard';

  const [form,       setForm]       = useState({ email: '', password: '' });
  const [showPw,     setShowPw]     = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [googleLoad, setGoogleLoad] = useState(false);
  const [error,      setError]      = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);

  // Map URL error codes to messages
  useEffect(() => {
    const errCode = searchParams.get('error');
    const messages = {
      SessionExpired:   'Your session has expired. Please sign in again.',
      Unauthorized:     'You need to sign in to access that page.',
      AccountNotFound:  'No OptiCore account found for your Google account. Please sign up first.',
      SyncError:        'Google sign-in sync failed. Please try again or use email/password.',
      OAuthSignin:      'Google sign-in was cancelled or failed. Please try again.',
      OAuthCallback:    'Google authentication failed. Please try again.',
      OAuthAccountNotLinked: 'This email is already registered. Sign in with email/password instead.',
    };
    if (errCode && messages[errCode]) setError(messages[errCode]);
  }, [searchParams]);


  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!captchaToken) {
      setError('Please verify that you are human.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Login failed. Please try again.');
        setLoading(false);
        return;
      }
      router.push(data.role === 'admin' ? '/admin' : from);
      router.refresh();
    } catch {
      setError('Network error. Please check your connection.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoad(true);
    try {
      // callbackUrl routes to the bridge which converts NextAuth session → OptiCore JWT
      await signIn('google', { callbackUrl: '/api/auth/bridge' });
    } catch {
      setError('Failed to start Google sign-in. Please try again.');
      setGoogleLoad(false);
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
        <Link href="/" className="inline-flex items-center gap-4 group">
          <Logo className="w-10 h-10" />
          <span className="font-bold text-sm">
            <span className="shimmer-text">OptiCore</span>
            <span className="text-text-muted ml-0.5">PH</span>
          </span>
        </Link>
      </div>

      {/* Main card */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 animate-fade-up">
        <div className="w-full max-w-md">
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

            {/* ── Google Sign-In ── */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoad || loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mb-5"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.88)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            >
              {googleLoad ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
              {googleLoad ? 'Redirecting to Google…' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-[10px] font-black uppercase tracking-widest text-text-faint">or</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* Email/Password form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.16em] mb-2" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
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
                    name="password"
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

              <Captcha onVerify={setCaptchaToken} />

              <button
                type="submit"
                disabled={loading || googleLoad || !captchaToken}
                className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed mt-1 flex items-center justify-center gap-2"
              >
                {loading ? <Spinner size="sm" /> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            {/* Footer links */}
            <p className="mt-6 text-center text-xs text-text-muted">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-brand-400 hover:underline font-bold">
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
