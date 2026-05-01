'use client';

import { Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function HeroStrip({ user, appliancesCount, onAddReading }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4">
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] animate-pulse">
            Live Neural Feedback
          </div>
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
            {format(new Date(), 'MMMM d, yyyy')}
          </span>
        </div>
        <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tighter leading-none">
          Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">{user?.name?.split(' ')[0] || 'User'}</span>
        </h1>
        <p className="text-slate-500 font-bold mt-4 text-lg">
          Analyzing telemetry for <span className="text-white">{appliancesCount} appliances</span> at <span className="text-white underline decoration-cyan-500/30 underline-offset-4">{user?.activeProperty?.name || 'Main Home'}</span>.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={onAddReading}
          className="flex items-center gap-3 px-10 py-5 rounded-2xl bg-white text-surface-1000 font-black text-sm uppercase tracking-[0.2em] hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-all duration-500 group shadow-2xl"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> 
          Add Bill Reading
        </button>
      </div>
    </div>
  );
}
