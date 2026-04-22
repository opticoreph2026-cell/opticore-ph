'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // In production, send to error tracking (Sentry, etc.)
    // Never log error.stack to console in production
    if (process.env.NODE_ENV === 'development') {
      console.error('[GlobalError]', error?.message);
    }
  }, [error]);

  return (
    <html lang="en-PH">
      <body className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 text-center">
        <div>
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
            <TriangleAlert className="w-7 h-7 text-red-400" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">Something went wrong</h1>
          <p className="text-sm text-gray-400 mb-7 max-w-sm mx-auto">
            An unexpected error occurred. Our team has been notified.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-black text-sm font-medium hover:bg-amber-400 transition-colors"
            >
              Try again
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl border border-white/10 text-sm text-white hover:bg-white/5 transition-colors"
            >
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
