'use client';

import { motion } from 'framer-motion';
import MouseSpotlightCard from '@/components/ui/MouseSpotlightCard';
import { Activity } from 'lucide-react';
import { clsx } from 'clsx';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function InitWatchCard({ gridStatus }: { gridStatus: any }) {
  const statusColors = {
    NORMAL: 'text-emerald-400',
    YELLOW: 'text-amber-400',
    RED: 'text-rose-400'
  };

  const statusBg = {
    NORMAL: 'bg-emerald-500/10 border-emerald-500/20',
    YELLOW: 'bg-amber-500/10 border-amber-500/20',
    RED: 'bg-rose-500/10 border-rose-500/20'
  };

  const status = gridStatus?.status || 'NORMAL';
  const penalty = gridStatus?.penalty || 0;

  return (
    <motion.div variants={item} className="w-full h-full">
      <MouseSpotlightCard className="p-6 flex flex-col h-full justify-between">
        <div className="flex items-center gap-3">
          <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center border", statusBg[status])}>
            <Activity className={clsx("w-5 h-5", statusColors[status])} />
          </div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Grid Status</p>
        </div>
        
        <div className="mt-6">
          <h3 className={clsx("text-xl font-black tracking-tight", statusColors[status])}>
            {status} ALERT
          </h3>
          <p className="text-xs font-bold text-slate-400 mt-2">
            {penalty > 0 ? `Peak usage penalty: +₱${penalty}/kWh` : 'Grid is operating normally.'}
          </p>
        </div>
      </MouseSpotlightCard>
    </motion.div>
  );
}
