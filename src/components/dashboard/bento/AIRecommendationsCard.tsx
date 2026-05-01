'use client';

import { motion } from 'framer-motion';
import MouseSpotlightCard from '@/components/ui/MouseSpotlightCard';
import { Sparkles } from 'lucide-react';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function AIRecommendationsCard({ report }: { report?: string | null }) {
  return (
    <motion.div variants={item} className="w-full h-full">
      <MouseSpotlightCard className="p-6 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">AI Bill Analysis</p>
        </div>
        
        <div className="flex-1 bg-surface-900/50 rounded-xl p-4 border border-white/5">
          {report ? (
            <p className="text-sm font-bold text-slate-300 leading-relaxed line-clamp-4">
              {report}
            </p>
          ) : (
            <p className="text-sm font-bold text-slate-500 italic flex items-center h-full justify-center">
              Scan a bill to generate your AI analysis.
            </p>
          )}
        </div>
        
        {report && (
          <div className="mt-4 text-right">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest cursor-pointer hover:underline">
              Read Full Report →
            </span>
          </div>
        )}
      </MouseSpotlightCard>
    </motion.div>
  );
}
