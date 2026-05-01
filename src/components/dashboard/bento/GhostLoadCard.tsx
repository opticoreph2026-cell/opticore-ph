'use client';

import { motion } from 'framer-motion';
import MouseSpotlightCard from '@/components/ui/MouseSpotlightCard';
import { Ghost } from 'lucide-react';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function GhostLoadCard({ ghostLoadPct }: { ghostLoadPct?: number | null }) {
  const isSetup = ghostLoadPct != null;
  
  return (
    <motion.div variants={item} className="w-full h-full">
      <MouseSpotlightCard className="p-6 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 relative">
              <Ghost className="w-5 h-5 text-purple-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-ping opacity-75" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full" />
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Phantom Load</p>
          </div>
        </div>
        
        <div className="mt-6">
          {isSetup ? (
            <>
              <h3 className="text-3xl font-black tracking-tight text-white">{ghostLoadPct}%</h3>
              <p className="text-xs font-bold text-slate-400 mt-2">Energy wasted by standby appliances</p>
            </>
          ) : (
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <p className="text-xs font-bold text-slate-400">Scan more appliances to calculate your phantom load.</p>
            </div>
          )}
        </div>
      </MouseSpotlightCard>
    </motion.div>
  );
}
