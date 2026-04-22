'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, ArrowRight, RefreshCcw, Zap, TriangleAlert } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';

export default function VerificationPage() {
  const router = useRouter();
  const hasRequested = useRef(false);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [user, setUser] = useState({ email: '', name: '', isNew: false });
  const [form, setForm] = useState({ otp: '', password: '' });

  // 1. Initial State Check & First OTP Request
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/auth/social-info');
        if (!res.ok) {
          router.push('/login?error=SessionExpired');
          return;
        }
        const data = await res.json();
        setUser(data);
        setLoading(false);

        // Auto-send first OTP (Only once)
        if (!hasRequested.current) {
          hasRequested.current = true;
          await requestOTP();
        }
      } catch (err) {
        setError('Failed to connect to authentication services.');
        setLoading(false);
      }
    }
    init();
  }, [router]);

  async function requestOTP() {
    setResending(true);
    setError('');
    try {
      const res = await fetch('/api/auth/otp');
      if (!res.ok) throw new Error('Failed to send code');
    } catch (err) {
      setError('Could not send verification code. Please try again.');
    } finally {
      setResending(false);
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (user.isNew && !form.password) {
      setError('Please choose a password to secure your account.');
      return;
    }

    if (form.otp.length !== 6) {
      setError('Please enter the 6-digit code sent to your email.');
      return;
    }

    setVerifying(true);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otp: form.otp,
          password: user.isNew ? form.password : undefined
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Verification failed. Please try again.');
      } else {
        router.push(data.redirect || '/dashboard');
      }
    } catch {
      setError('A connection error occurred.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-text-muted text-sm animate-pulse">Securing your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col sm:justify-center p-4 overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md mx-auto relative">
        <div className="mb-8 text-center sm:text-left">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-brand-500 uppercase tracking-widest leading-none mb-1">Security</span>
              <span className="font-semibold text-lg shimmer-text">OptiCore Identity</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            {user.isNew ? 'Complete your Registration' : 'Verify your Identity'}
          </h1>
          <p className="text-sm text-text-muted mt-2 max-w-sm">
            We've sent a 6-digit verification code to <span className="text-text-primary font-medium">{user.email}</span>.
          </p>
        </div>

        <div className="card border-brand-500/10">
          <form onSubmit={handleVerify} className="space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-fade-up">
                <TriangleAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs text-red-300 font-medium leading-relaxed">{error}</p>
              </div>
            )}

            {/* Password Field (Only for New Users) */}
            {user.isNew && (
              <div className="animate-fade-up">
                <label className="flex items-center gap-2 text-xs text-text-muted mb-2 font-medium">
                  <Lock className="w-3 h-3" />
                  Desired Account Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Create a strong password"
                  className="input-field"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  minLength={8}
                />
                <p className="text-[10px] text-text-muted mt-2 px-1">
                  Min 8 characters. You'll need this for future sign-ins.
                </p>
              </div>
            )}

            {/* OTP Field */}
            <div>
              <label className="flex items-center gap-2 text-xs text-text-muted mb-2 font-medium">
                <Mail className="w-3 h-3" />
                6-Digit Login Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="0 0 0 0 0 0"
                  className="input-field text-center text-xl tracking-[0.5em] font-mono placeholder:tracking-normal placeholder:font-sans placeholder:text-sm"
                  value={form.otp}
                  onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, '') })}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={verifying}
                className="btn-primary w-full group relative overflow-hidden h-12"
              >
                {verifying ? <Spinner size="sm" /> : (
                  <span className="flex items-center justify-center gap-2">
                    {user.isNew ? 'Finish Account Setup' : 'Verify & Enter Dashboard'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
            <p className="text-xs text-text-secondary mb-3">Didn't receive the code?</p>
            <button
              onClick={requestOTP}
              disabled={resending}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-brand-400 hover:text-brand-300 hover:bg-brand-500/10 transition-all disabled:opacity-50"
            >
              <RefreshCcw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
              {resending ? 'Sending Code...' : 'Resend Verification Email'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-text-muted mt-8">
          Logged in with Google as <span className="text-text-secondary">{user.email}</span>.{' '}
          <Link href="/login" className="text-text-primary hover:text-brand-400 font-medium">
            Not you?
          </Link>
        </p>
      </div>
    </div>
  );
}
