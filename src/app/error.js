'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { TriangleAlert, LayoutDashboard, RotateCw } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('[Route Error]', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center animate-fade-up">
      <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-8 shadow-amber-md">
        <TriangleAlert className="w-10 h-10 text-amber-400 animate-pulse-slow" />
      </div>
      
      <h2 className="text-3xl font-bold text-text-primary mb-4">Data Stream Interrupted</h2>
      
      <p className="text-text-secondary max-w-md mx-auto mb-10 leading-relaxed">
        We encountered an unexpected anomaly while loading this data. Our engineering algorithms have been notified of the disruption.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="btn-primary w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2"
        >
          <RotateCw className="w-4 h-4" /> Attempt Reconnect
        </button>
        <Link href="/dashboard" className="btn-ghost w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2">
          <LayoutDashboard className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
