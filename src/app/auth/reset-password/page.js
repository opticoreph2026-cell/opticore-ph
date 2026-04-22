'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Zap, Lock, KeyRound, ShieldCheck, CircleAlert, Eye, EyeOff } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to reset password.');
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md w-full mx-auto relative z-10 animate-fade-in text-center p-8 bg-surface-900 border border-emerald-500/10 rounded-3xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 text-emerald-400">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">Security Restored</h2>
        <p className="text-sm text-text-muted mt-3 mb-8 leading-relaxed">
           Password updated successfully. Redirecting you to the sign-in page...
        </p>
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto relative z-10 animate-fade-up">
      <div className="card shadow-2xl shadow-brand-500/5 border-white/[0.04]">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Complete Recovery</h1>
          <p className="text-sm text-text-muted mt-2">Check <span className="text-brand-400 font-medium">{email}</span> for your 6-digit recovery code.</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <CircleAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-300 antialiased">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Recovery Code (6 digits)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-4 w-4 text-text-muted opacity-60" />
                </div>
                <input
                  id="otp"
                  type="text"
                  required
                  maxLength="6"
                  placeholder="000 000"
                  className="input-field pl-10 h-10 text-center tracking-[4px] font-bold text-brand-400"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
            </div>

            <div>
              <label htmlFor="pass" className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-text-muted opacity-60" />
                </div>
                <input
                  id="pass"
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="At least 8 chars"
                  className="input-field pl-10 pr-10 h-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                 <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                    onClick={() => setShowPw(p => !p)}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm" className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ShieldCheck className="h-4 w-4 text-text-muted opacity-60" />
                </div>
                <input
                  id="confirm"
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="Repeat your password"
                  className="input-field pl-10 h-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full h-12 flex items-center justify-center gap-2 group mt-6"
          >
            {loading ? <Spinner size="sm" /> : 'Sync New Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-surface-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="fixed -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />
      <Suspense fallback={<div className="flex justify-center"><Spinner /></div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
