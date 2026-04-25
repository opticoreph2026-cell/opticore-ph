'use client';

import { useEffect } from 'react';
import { ShieldAlert, RotateCw } from 'lucide-react';
import './globals.css'; // Ensure styles load even in global error

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // In production, send to error tracking
    if (process.env.NODE_ENV === 'development') {
      console.error('[GlobalError]', error?.message);
    }
  }, [error]);

  return (
    <html lang="en-PH">
      <body className="min-h-screen bg-surface-950 flex items-center justify-center px-4 text-center overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-50 z-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-red-500/5 blur-[150px] pointer-events-none z-0" />
        
        <div className="relative z-10 animate-fade-up">
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <ShieldAlert className="w-10 h-10 text-red-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">System Failure Detected</h1>
          
          <p className="text-text-secondary max-w-sm mx-auto mb-10 leading-relaxed">
            A critical exception occurred at the root level. The command center has logged this event for immediate engineering review.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => reset()}
              className="px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest bg-gradient-to-r from-red-500 to-red-400 text-black hover:opacity-90 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
            >
              <RotateCw className="w-4 h-4" /> Reboot System
            </button>
            <a
              href="/"
              className="px-8 py-4 rounded-xl border border-white/10 text-sm font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all"
            >
              Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
