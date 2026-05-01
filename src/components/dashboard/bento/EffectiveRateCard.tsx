'use client';

import { motion } from 'framer-motion';
import MouseSpotlightCard from '@/components/ui/MouseSpotlightCard';
import { Zap } from 'lucide-react';
import { formatRateUnits } from '@/lib/money';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function EffectiveRateCard({ effectiveRate }: { effectiveRate: number }) {
  return (
    <motion.div variants={item} className="w-full h-full">
      <MouseSpotlightCard className="p-6 flex flex-col h-full justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Effective Rate</p>
        </div>
        
        <div className="mt-6">
          <h3 className="text-3xl font-black tracking-tight text-white">
            {formatCentavosToPesos(effectiveRate)}<span className="text-lg text-slate-500">/kWh</span>
          </h3>
          <p className="text-xs font-bold text-slate-400 mt-2">True cost after all hidden charges</p>
        </div>
      </MouseSpotlightCard>
    </motion.div>
  );
}

// Helper local since rate is stored differently or calculated dynamically
function formatCentavosToPesos(centavos: number) {
  return `₱${(centavos / 100).toFixed(2)}`;
}
