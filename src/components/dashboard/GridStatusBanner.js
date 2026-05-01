'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Zap, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

/**
 * GridStatusBanner — Optional Insights widget.
 * Translates grid demand patterns into simple, actionable advice for households.
 * Data source: /api/dashboard/grid-status (internal heuristic, not a live feed).
 */
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
          "relative overflow-hidden p-8 rounded-[32px] border transition-all duration-700 shadow-2xl mb-12 bg-surface-950/60 backdrop-blur-3xl",
          isRed 
            ? "border-rose-500/30 shadow-rose-500/10" 
            : "border-amber-500/30 shadow-amber-500/10"
        )}
      >
        {/* Background Glow */}
        <div className={clsx(
          "absolute -top-24 -right-24 w-64 h-64 blur-[120px] opacity-20 pointer-events-none",
          isRed ? "bg-rose-500" : "bg-amber-500"
        )} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
          <div className={clsx(
            "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl border transition-transform duration-700 hover:rotate-6",
            isRed 
              ? "bg-rose-500/20 text-rose-400 border-rose-500/40" 
              : "bg-amber-500/20 text-amber-400 border-amber-500/40"
          )}>
            {isRed ? <ShieldAlert className="w-8 h-8 animate-pulse" /> : <AlertTriangle className="w-8 h-8 animate-pulse" />}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <span className={clsx(
                "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] border",
                isRed ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              )}>
                Grid Status Alert
              </span>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Higher Rates Active</span>
              </div>
            </div>
            <h4 className="text-2xl font-black text-white tracking-tighter leading-none mb-2">
              {isRed 
                ? "Grid Critical: Power interruptions may occur. Turn off non-essentials now." 
                : "Energy Alert: Demand is extremely high. High electricity rates are currently active."
              }
            </h4>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Grid Status (Beta)</p>
          </div>

          <div className="shrink-0 flex items-center gap-6">
            <div className="text-right hidden lg:block">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Suggested Action</p>
              <p className={clsx("text-lg font-black uppercase tracking-tighter", isRed ? "text-rose-400" : "text-amber-400")}>
                {isRed ? 'Unplug Appliances' : 'Reduce Usage'}
              </p>
            </div>
            <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/[0.05] border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/[0.08] transition-all duration-500 group shadow-xl">
              <Info className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              How to Save
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
