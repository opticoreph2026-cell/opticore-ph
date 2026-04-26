'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, LayoutDashboard } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('[OptiCore Root Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-4 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.05),transparent_50%)] pointer-events-none" />
      
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-sky-500/20 blur-[100px] rounded-full" />
        <div className="relative w-24 h-24 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center justify-center shadow-2xl backdrop-blur-xl animate-pulse-slow">
          <AlertTriangle className="w-12 h-12 text-sky-400" />
        </div>
      </div>
      
      <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight sm:text-5xl">
        System Anomaly Detected
      </h1>
      
      <p className="text-slate-400 max-w-lg mx-auto mb-12 text-lg leading-relaxed">
        The platform encountered an unexpected disruption in the intelligence stream. 
        Our engineering protocols have been notified.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-5 relative z-10">
        <button
          onClick={() => reset()}
          className="w-full sm:w-auto bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-10 py-4 rounded-2xl transition-all shadow-xl shadow-sky-500/20 active:scale-95 flex items-center justify-center gap-3"
        >
          <RotateCcw className="w-5 h-5" />
          Attempt Recovery
        </button>
        <Link 
          href="/dashboard" 
          className="w-full sm:w-auto bg-slate-900/50 hover:bg-slate-800 text-white font-semibold px-10 py-4 rounded-2xl border border-slate-800 transition-all backdrop-blur-md flex items-center justify-center gap-3"
        >
          <LayoutDashboard className="w-5 h-5" />
          Return to Hub
        </Link>
      </div>

      <footer className="mt-20 text-slate-600 text-xs font-mono uppercase tracking-[0.2em]">
        Error Protocol: {error?.digest || '0xOPTIMA_GEN_ERR'}
      </footer>
    </div>
  );
}
