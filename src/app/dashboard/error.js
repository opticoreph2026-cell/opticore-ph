'use client';

import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in duration-700">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-sky-500/20 blur-3xl rounded-full" />
        <div className="relative w-20 h-20 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-center shadow-2xl backdrop-blur-sm">
          <AlertTriangle className="w-10 h-10 text-sky-400" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Intelligence Stream Interrupted</h2>
      <p className="text-slate-400 text-sm max-w-sm mb-8 leading-relaxed">
        Our analytics engine encountered a synchronization error while processing this sector. 
        {process.env.NODE_ENV === 'development' && (
          <span className="block mt-2 font-mono text-[10px] text-sky-500/70 p-2 bg-slate-900/50 rounded border border-slate-800">
            {error?.message}
          </span>
        )}
      </p>

      <div className="flex items-center gap-3">
        <button 
          onClick={reset} 
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-6 py-2.5 rounded-xl transition-all active:scale-95 text-sm shadow-lg shadow-sky-500/20"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium px-6 py-2.5 rounded-xl border border-slate-800 transition-all text-sm"
        >
          <Home className="w-4 h-4" />
          Dashboard
        </Link>
      </div>
    </div>
  );
}
