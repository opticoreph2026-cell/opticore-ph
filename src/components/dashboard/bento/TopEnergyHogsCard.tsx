'use client';

import { motion } from 'framer-motion';
import MouseSpotlightCard from '@/components/ui/MouseSpotlightCard';
import { Flame } from 'lucide-react';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function TopEnergyHogsCard() {
  // Hardcoded for MVP unless SWR passes appliances data here
  const hogs = [
    { name: 'Air Conditioner (Living Room)', share: 45, kwh: 120 },
    { name: 'Refrigerator', share: 25, kwh: 65 },
    { name: 'Water Heater', share: 15, kwh: 40 },
  ];

  return (
    <motion.div variants={item} className="w-full h-full">
      <MouseSpotlightCard className="p-6 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
            <Flame className="w-5 h-5 text-rose-400" />
          </div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Top Energy Hogs</p>
        </div>
        
        <div className="space-y-4 flex-1 flex flex-col justify-center">
          {hogs.map((hog, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm font-bold mb-1">
                <span className="text-white">{hog.name}</span>
                <span className="text-rose-400">{hog.share}%</span>
              </div>
              <div className="w-full h-2 bg-surface-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${hog.share}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </MouseSpotlightCard>
    </motion.div>
  );
}
