'use client';

import useSWR from 'swr';
import { motion } from 'framer-motion';
import SavingsHeroCard from './SavingsHeroCard';
import EffectiveRateCard from './EffectiveRateCard';
import GhostLoadCard from './GhostLoadCard';
import InitWatchCard from './InitWatchCard';
import BillHistoryCard from './BillHistoryCard';
import SulitModeCTA from './SulitModeCTA';
import TopEnergyHogsCard from './TopEnergyHogsCard';
import AIRecommendationsCard from './AIRecommendationsCard';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DashboardClient({ fallbackData }: { fallbackData: any }) {
  const { data } = useSWR('/api/dashboard/data', fetcher, {
    fallbackData,
    refreshInterval: 60000, // refresh every minute
  });

  const kpiData = data?.kpiData || {};
  const readings = data?.readings || [];
  const gridStatus = data?.gridStatus || {};
  const latestReport = data?.latestReport;

  // Stagger animation container
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <motion.div 
      className="flex flex-col gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Overview</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Energy Command Center</p>
        </div>
      </div>

      {/* Row 1: Hero */}
      <div className="grid grid-cols-1">
        <SavingsHeroCard kpiData={kpiData} />
      </div>

      {/* Row 2: 3-col Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EffectiveRateCard effectiveRate={kpiData.effectiveRate} />
        <GhostLoadCard ghostLoadPct={kpiData.ghostLoadPct} />
        <InitWatchCard gridStatus={gridStatus} />
      </div>

      {/* Row 3: 2-col Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BillHistoryCard readings={readings} />
        </div>
        <div className="lg:col-span-1">
          <SulitModeCTA />
        </div>
      </div>

      {/* Row 4: 2-col Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopEnergyHogsCard />
        <AIRecommendationsCard report={latestReport} />
      </div>
    </motion.div>
  );
}
