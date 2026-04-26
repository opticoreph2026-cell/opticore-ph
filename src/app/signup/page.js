'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, TriangleAlert, ArrowRight, Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import Logo from '@/components/ui/Logo';
import Captcha from '@/components/ui/Captcha';



function SignupForm() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const planParam   = searchParams.get('plan'); // e.g. 'pro', 'business'
  const paidParam   = searchParams.get('paid') === 'true';
  const emailParam  = searchParams.get('email');

  const [form, setForm] = useState({
    name: '', 
    email: emailParam || '', 
    password: '', 
    confirm: '', 
    consent: false,
  });

  const [showPw,     setShowPw]     = useState(false);
  const [showCPw,    setShowCPw]    = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);

  // Sync email param if it changes
  useEffect(() => {
    if (emailParam) setForm(f => ({ ...f, email: emailParam }));
  }, [emailParam]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captchaToken) {
      setError('Please verify that you are human.');
      return;
    }
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          consent: form.consent,
          plan: planParam,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to create account.');
        setLoading(false);
      } else {
        setLoading(false);
        setSuccess(true);
        
        // If a plan was selected and NOT yet paid, trigger checkout automatically
        if (!paidParam && planParam && (planParam === 'pro' || planParam === 'business')) {
          try {
            const checkoutRes = await fetch('/api/checkout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ plan: planParam, interval: 'monthly' }),
            });
            const checkoutData = await checkoutRes.json();
            if (checkoutRes.ok && checkoutData.url) {
              setTimeout(() => { window.location.href = checkoutData.url; }, 800);
              return;
            }
          } catch (checkoutErr) {
            // Silently fail auto-checkout and proceed to onboarding
          }
        }
        
        setTimeout(() => router.push(data.redirect || '/onboarding'), 1200);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-surface-950 flex flex-col sm:justify-center p-4 relative overflow-hidden">
      {/* Backgrounds */}
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-radial pointer-events-none z-0" />
      <div className="fixed top-1/3 right-1/4 w-72 h-72 rounded-full bg-brand-500/3 blur-3xl pointer-events-none z-0" />

      <div className="w-full max-w-md mx-auto relative z-10 py-10 animate-fade-up">
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-10">
          <Link href="/" className="mb-6 hover:scale-105 transition-transform">
            <Logo className="w-14 h-14" />
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tighter text-center">
            Create Your Account
          </h1>
          <p className="text-text-muted mt-2 text-sm text-center">
            Join households optimizing infrastructure across the Philippines.
          </p>
          
          {paidParam && (
            <div className="mt-4 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center gap-2 animate-bounce-subtle">
              <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Payment Verified: {planParam} Plan</span>
            </div>
          )}
        </div>

        {/* Plan badge */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-[11px] font-bold text-brand-400">
            <Sparkles className="w-3 h-3" />
            <span className="capitalize">{planParam || 'Starter'}</span> Plan Selected — upgrade anytime
          </div>
        </div>

        {/* Main card */}
        <div
          className="rounded-3xl"
          style={{
            background: 'rgba(16,16,24,0.90)',
            backdropFilter: 'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            border: '1px solid rgba(255,255,255,0.065)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset, 0 32px 80px rgba(0,0,0,0.6)',
          }}
        >
          {success ? (
            <div className="text-center py-14 px-8 animate-scale-in">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 relative"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}
              >
                <Check className="w-8 h-8 text-emerald-400" />
                <div className="absolute -inset-2 rounded-full border border-emerald-500/10 animate-pulse-slow" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Account Created!</h2>
              <p className="text-sm text-text-muted mb-6">Setting up your profile…</p>
              <div className="flex justify-center"><Spinner /></div>
            </div>
          ) : (
            <div className="p-7 space-y-5">



              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl flex items-start gap-2 animate-fade-up"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}
                  >
                    <TriangleAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-300 font-medium leading-relaxed">{error}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-[10px] font-black text-text-muted uppercase tracking-[0.16em] mb-2">Full Name</label>
                  <input
                    id="name" name="name" required
                    className="input-field capitalize"
                    placeholder="Juan Dela Cruz"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-[10px] font-black text-text-muted uppercase tracking-[0.16em] mb-2">Email address</label>
                  <input
                    id="email" name="email" required type="email"
                    className="input-field"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="password" className="block text-[10px] font-black text-text-muted uppercase tracking-[0.16em] mb-2">Password</label>
                    <div className="relative">
                      <input
                        id="password" name="password" required
                        type={showPw ? 'text' : 'password'} minLength={8}
                        className="input-field pr-10"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                      />
                      <button type="button" onClick={() => setShowPw(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-muted transition-colors"
                        aria-label="Toggle password visibility">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirm" className="block text-[10px] font-black text-text-muted uppercase tracking-[0.16em] mb-2">Confirm</label>
                    <div className="relative">
                      <input
                        id="confirm" name="confirm" required
                        type={showCPw ? 'text' : 'password'}
                        className="input-field pr-10"
                        placeholder="••••••••"
                        value={form.confirm}
                        onChange={e => setForm({ ...form, confirm: e.target.value })}
                      />
                      <button type="button" onClick={() => setShowCPw(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-muted transition-colors"
                        aria-label="Toggle confirm password visibility">
                        {showCPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Consent */}
                <label className="flex items-start gap-3 cursor-pointer group pt-1">
                  <input
                    id="consent" name="consent" type="checkbox" required
                    className="mt-0.5 w-4 h-4 rounded border-white/10 bg-white/5 text-brand-500 focus:ring-brand-500/20 shrink-0"
                    checked={form.consent}
                    onChange={e => setForm({ ...form, consent: e.target.checked })}
                  />
                  <span className="text-[11px] text-text-muted leading-relaxed group-hover:text-text-secondary transition-colors">
                    I agree to the{' '}
                    <Link href="/terms" className="text-brand-400 hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-brand-400 hover:underline">Privacy Policy</Link>
                    , and consent to data processing under the Data Privacy Act of 2012.
                  </span>
                </label>

                <Captcha onVerify={setCaptchaToken} />

                <button
                  type="submit"
                  disabled={loading || !captchaToken}
                  className="btn-primary w-full mt-1 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <Spinner size="sm" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-text-muted mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-400 font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-950" />}>
      <SignupForm />
    </Suspense>
  );
}
