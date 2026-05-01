'use client';

import { motion } from 'framer-motion';
import MouseSpotlightCard from '@/components/ui/MouseSpotlightCard';
import { formatPHP } from '@/lib/money';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function SavingsHeroCard({ kpiData }: { kpiData: any }) {
  const currentBill = kpiData?.currentMonthBill || 0;
  
  return (
    <motion.div variants={item} className="w-full h-full">
      <MouseSpotlightCard className="p-8 h-full flex flex-col justify-center">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Current Bill Estimate</p>
            <h2 className="text-5xl lg:text-7xl font-black tracking-tighter text-white">
              {formatPHP(currentBill)}
            </h2>
            {kpiData?.momChangePct != null && (
              <p className="mt-4 text-sm font-bold text-slate-400">
                <span className={kpiData.momChangePct > 0 ? "text-rose-500" : "text-emerald-500"}>
                  {kpiData.momChangePct > 0 ? '+' : ''}{kpiData.momChangePct.toFixed(1)}%
                </span> vs last month
              </p>
            )}
          </div>
          
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-surface-1000 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]">
              Pay Bill
            </button>
            <button className="px-6 py-3 bg-white/[0.05] hover:bg-white/[0.1] text-white font-bold rounded-xl transition-all border border-white/10">
              View Breakdown
            </button>
          </div>
        </div>
      </MouseSpotlightCard>
    </motion.div>
  );
}
