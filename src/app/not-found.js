import Link from 'next/link';
import { Radar, LayoutDashboard, Home } from 'lucide-react';

/**
 * OptiCore PH - 404 Intelligence Gap Page
 * Switched to pure Tailwind to ensure Server Component compatibility and build stability.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
      {/* Radar Pulse Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-[300px] h-[300px] border border-sky-500/10 rounded-full animate-[ping_3s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-sky-500/5 rounded-full animate-[ping_3s_linear_infinite] [animation-delay:700ms]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-sky-500/5 rounded-full animate-[ping_3s_linear_infinite] [animation-delay:1000ms]" />
      </div>

      <div className="relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-sky-500/20 blur-3xl rounded-full scale-150" />
          <div className="relative w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl mx-auto">
            {/* Custom 6s spin using Tailwind arbitrary value */}
            <Radar className="w-12 h-12 text-sky-400 animate-[spin_6s_linear_infinite]" />
          </div>
        </div>

        <h1 className="text-6xl font-black text-white/5 mb-2 tracking-tight select-none">404</h1>
        <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Intelligence Gap</h2>
        
        <p className="text-slate-400 max-w-sm mx-auto mb-12 text-lg leading-relaxed">
          Our scanning protocol indicates this sector is currently offline or never existed. 
          The data stream has been localized to the main hub.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/dashboard" 
            className="w-full sm:w-auto bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-10 py-4 rounded-2xl transition-all shadow-xl shadow-sky-500/20 active:scale-95 flex items-center justify-center gap-3"
          >
            <LayoutDashboard className="w-5 h-5" />
            Return to Dashboard
          </Link>
          <Link 
            href="/" 
            className="w-full sm:w-auto bg-slate-900/50 hover:bg-slate-800 text-white font-semibold px-10 py-4 rounded-2xl border border-slate-800 transition-all backdrop-blur-md flex items-center justify-center gap-3"
          >
            <Home className="w-5 h-5" />
            Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}
