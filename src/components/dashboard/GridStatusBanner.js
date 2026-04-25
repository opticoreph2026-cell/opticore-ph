'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Zap, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export default function GridStatusBanner() {
  const [grid, setGrid] = useState(null);

  useEffect(() => {
    fetch('/api/dashboard/grid-status')
      .then(res => res.json())
      .then(data => setGrid(data))
      .catch(console.error);
  }, []);

  if (!grid || grid.status === 'NORMAL') return null;

  const isRed = grid.status === 'RED';
  
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={clsx(
          "relative overflow-hidden p-6 rounded-[32px] border transition-all duration-500 shadow-2xl",
          isRed 
            ? "bg-rose-500/5 border-rose-500/20 shadow-rose-500/10" 
            : "bg-amber-500/5 border-amber-500/20 shadow-amber-500/10"
        )}
      >
        {/* Background Animation */}
        <div className={clsx(
          "absolute top-0 right-0 w-64 h-full blur-[80px] opacity-20 pointer-events-none translate-x-1/2",
          isRed ? "bg-rose-500" : "bg-amber-500"
        )} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className={clsx(
            "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border",
            isRed 
              ? "bg-rose-500/20 text-rose-400 border-rose-500/30" 
              : "bg-amber-500/20 text-amber-400 border-amber-500/30"
          )}>
            {isRed ? <ShieldAlert className="w-7 h-7 animate-pulse" /> : <AlertTriangle className="w-7 h-7 animate-pulse" />}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={clsx(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]",
                isRed ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"
              )}>
                Grid {grid.status} Protocol
              </span>
              <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/[0.03] border border-white/5">
                <Zap className="w-3 h-3 text-cyan-400" />
                <span className="text-[10px] font-black text-slate-300 uppercase">+{grid.surgePenaltyPercent}% Surge</span>
              </div>
            </div>
            <h4 className="text-lg font-black text-white tracking-tight">{grid.message}</h4>
          </div>

          <div className="shrink-0 flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Incident Level</p>
              <p className={clsx("text-sm font-black uppercase", isRed ? "text-rose-400" : "text-amber-400")}>
                {isRed ? 'Critical' : 'Warning'}
              </p>
            </div>
            <button className="px-6 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/[0.08] transition-all">
              Details
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
