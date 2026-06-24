'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { PasswordInput } from '@/components/ui/PasswordInput';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { error, success } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.password?.[0] || data.error || 'Something went wrong');
      }

      setDone(true);
      success('Password has been reset successfully.');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-6">
        <p className="text-accent-rose text-sm mb-4">Invalid reset link. No token provided.</p>
        <Link href="/forgot-password" className="text-sm text-accent-cyan hover:text-accent-cyan/80 transition-colors font-medium">
          Request a new reset link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-accent-emerald/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-accent-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-white/80 text-sm mb-6">Your password has been reset successfully.</p>
        <Link
          href="/login"
          className="text-sm text-accent-cyan hover:text-accent-cyan/80 transition-colors font-medium"
        >
          Sign in with your new password
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <PasswordInput
        id="password"
        label="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
        required
      />

      <PasswordInput
        id="confirmPassword"
        label="Confirm New Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        autoComplete="new-password"
        required
      />

      <button
        type="submit"
        disabled={loading || !password || !confirmPassword}
        className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-accent-cyan to-accent-emerald hover:opacity-90 disabled:opacity-50"
      >
        {loading ? <Spinner className="w-5 h-5 text-white" /> : 'Reset Password'}
      </button>

      <p className="text-center text-xs text-white/40">
        Remember your password?{' '}
        <Link href="/login" className="font-medium text-accent-cyan hover:text-accent-cyan/80 transition-colors">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-surface-1000 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-accent-emerald/10 rounded-full blur-[100px] pointer-events-none translate-x-1/2" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center">
        <Logo className="mb-6 h-12" />
        <h2 className="text-center text-3xl font-display font-bold text-white tracking-tight">
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-white/60">Choose a new password for your account</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-surface-900/80 backdrop-blur-md py-8 px-4 shadow-2xl border border-border-subtle sm:rounded-2xl sm:px-10">
          <Suspense fallback={<Spinner className="w-6 h-6 text-white/40 mx-auto" />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
