'use client';

import { motion } from 'framer-motion';
import MouseSpotlightCard from '@/components/ui/MouseSpotlightCard';
import { Calculator } from 'lucide-react';
import Link from 'next/link';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function SulitModeCTA() {
  return (
    <motion.div variants={item} className="w-full h-full">
      <Link href="/dashboard/simulator" className="block w-full h-full group">
        <MouseSpotlightCard className="p-6 flex flex-col h-full justify-between bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/20 group-hover:border-cyan-500/40 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 mb-6 group-hover:scale-110 transition-transform">
            <Calculator className="w-6 h-6 text-cyan-400" />
          </div>
          
          <div>
            <h3 className="text-xl font-black tracking-tight text-white mb-2">Sulit Mode Simulator</h3>
            <p className="text-sm font-bold text-slate-400">
              Interactive "what-if" math. Adjust your AC and lights to see real-time savings.
            </p>
            <div className="mt-4 flex items-center text-xs font-black text-cyan-400 uppercase tracking-widest">
              Launch Simulator <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </MouseSpotlightCard>
      </Link>
    </motion.div>
  );
}
