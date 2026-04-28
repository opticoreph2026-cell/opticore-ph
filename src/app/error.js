'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, LayoutDashboard } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('[OptiCore Root Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center px-4 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.05),transparent_50%)] pointer-events-none" />
      
      <div className="relative mb-10 animate-fade-up">
        <div className="absolute inset-0 bg-brand-500/20 blur-[100px] rounded-full" />
        <div className="relative w-24 h-24 rounded-3xl bg-surface-900 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-xl animate-pulse-slow">
          <AlertTriangle className="w-12 h-12 text-brand-400" />
        </div>
      </div>
      
      <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight sm:text-5xl animate-fade-up" style={{ animationDelay: '100ms' }}>
        System Anomaly Detected
      </h1>
      
      <p className="text-text-secondary max-w-lg mx-auto mb-12 text-lg leading-relaxed animate-fade-up" style={{ animationDelay: '200ms' }}>
        The platform encountered an unexpected disruption in the intelligence stream. 
        Our engineering protocols have been notified.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-5 relative z-10 animate-fade-up" style={{ animationDelay: '300ms' }}>
        <button
          onClick={() => reset()}
          className="w-full sm:w-auto bg-brand-500 hover:bg-brand-400 text-surface-950 font-bold px-10 py-4 rounded-2xl transition-all shadow-xl shadow-brand-500/20 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
        >
          <RotateCcw className="w-5 h-5" />
          Attempt Recovery
        </button>
        <Link 
          href="/dashboard" 
          className="w-full sm:w-auto bg-surface-900 hover:bg-surface-800 text-white font-semibold px-10 py-4 rounded-2xl border border-white/10 transition-all backdrop-blur-md flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
        >
          <LayoutDashboard className="w-5 h-5" />
          Return to Hub
        </Link>
      </div>

      <footer className="mt-20 text-text-faint text-xs font-mono uppercase tracking-[0.2em] animate-fade-up" style={{ animationDelay: '400ms' }}>
        Error Protocol: {error?.digest || '0xOPTIMA_GEN_ERR'}
      </footer>
    </div>
  );
}
