'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Zap, TrendingDown, Plus, 
  ArrowUpRight, ArrowDownRight, MoreHorizontal,
  ChevronRight, Activity, Calendar, Sparkles
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import SubmitReadingModal from '@/components/dashboard/SubmitReadingModal';
import GridStatusBanner from '@/components/dashboard/GridStatusBanner';
import Toast from '@/components/ui/Toast';
import SpotlightCard from '@/components/ui/SpotlightCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  },
};

export default function DashboardOverview({ user, readings = [], alerts = [], appliances = [] }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const latest = readings[0] || {};
  const previous = readings[1] || {};
  
  const totalBill = (latest.billAmountElectric ?? 0) + (latest.billAmountWater ?? 0);
  const prevTotalBill = (previous.billAmountElectric ?? 0) + (previous.billAmountWater ?? 0);
  
  const billDelta = useMemo(() => {
    if (!totalBill || !prevTotalBill) return '0.0';
    return ((totalBill - prevTotalBill) / prevTotalBill * 100).toFixed(1);
  }, [totalBill, prevTotalBill]);

  const chartData = useMemo(() => {
    if (!readings || readings.length === 0) {
      return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => ({ name: m, value: 0, water: 0, bill: 0 }));
    }
    
    // Group by month to avoid duplicates if multiple readings exist for the same month
    const groups = {};
    [...readings].forEach(r => {
      const date = parseISO(r.readingDate);
      const monthKey = format(date, 'yyyy-MM');
      if (!groups[monthKey]) {
        groups[monthKey] = { name: format(date, 'MMM'), fullDate: date, value: 0, water: 0, bill: 0 };
      }
      groups[monthKey].value += (r.kwhUsed ?? 0);
      groups[monthKey].water += (r.m3Used ?? 0);
      groups[monthKey].bill += (r.billAmountElectric ?? 0) + (r.billAmountWater ?? 0);
    });

    return Object.values(groups)
      .sort((a, b) => a.fullDate - b.fullDate)
      .slice(-12);
  }, [readings]);

  // Intelligence Summary derived from alerts and plan
  const intelligenceSummary = useMemo(() => {
    if (alerts.length > 0) {
      const critical = alerts.filter(a => a.severity === 'critical');
      if (critical.length > 0) return `${critical.length} critical issues require attention.`;
      return `${alerts.length} active system notifications.`;
    }
    return "All systems operational. No anomalies detected.";
  }, [alerts]);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 lg:p-0 space-y-8"
    >
      {/* ── Condensed Hero ── */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bento-card p-8 lg:p-10 bg-gradient-to-br from-white/[0.03] to-transparent flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-display text-3xl font-black text-white tracking-tight">
              Operational Overview
            </h1>
            <p className="text-slate-500 font-medium mt-2 max-w-md">
              Monitoring <span className="text-cyan-400 font-black">{appliances.length} assets</span> across your grid.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary shrink-0"
          >
            <Plus className="w-4 h-4" /> Log Reading
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <GridStatusBanner />
      </motion.div>

      {/* ── Row 1: KPI Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <motion.div variants={itemVariants}>
          <KpiCard 
            label="Grid Efficiency"
            value="0.94"
            delta="Optimal"
            isPositive={true}
            icon={Zap}
            color="purple"
            sparklineData={chartData.slice(-6)}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard 
            label="Current Billing"
            value={`₱${totalBill.toLocaleString()}`}
            delta={`${billDelta}%`}
            isPositive={parseFloat(billDelta) < 0}
            icon={TrendingDown}
            color="amber"
            sparklineData={chartData.slice(-6)}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard 
            label="Health Status"
            value="Stable"
            delta="98.2%"
            isPositive={true}
            icon={Activity}
            color="rose"
            sparklineData={chartData.slice(-6)}
          />
        </motion.div>
      </div>

      {/* ── Row 2: Main Chart ── */}
      <motion.div variants={itemVariants}>
        <SpotlightCard className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-display text-xl font-black text-white">Consumption Protocol</h3>
              <p className="text-sm text-slate-500 mt-1">Holistic utility trends</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Calendar className="w-3 h-3" />
                Annual View
              </div>
              <button className="p-2 rounded-xl hover:bg-white/5 text-slate-500 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#475569', fontSize: 11, fontWeight: 700}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#475569', fontSize: 11}}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(5, 5, 8, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    backdropFilter: 'blur(10px)'
                  }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#22d3ee" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>
      </motion.div>

      {/* ── Row 3: Intelligence Insights ── */}
      <div className="grid grid-cols-12 gap-6">
        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-8">
          <SpotlightCard className="p-8 h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-display text-xl font-black text-white">Intelligence Summary</h3>
              <Link href="/dashboard/alerts" className="text-[10px] font-black text-cyan-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
                View System Alerts <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">
                <Sparkles className="w-8 h-8" />
              </div>
              <p className="text-lg font-bold text-white max-w-md">{intelligenceSummary}</p>
              <p className="text-sm text-slate-500 mt-2">Gemini AI is auditing your grid in real-time.</p>
            </div>
          </SpotlightCard>
        </motion.div>

        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-4">
          <div className="bento-card p-8 bg-gradient-to-br from-brand-secondary/20 to-brand-primary/20 border-white/10 h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-display text-2xl font-black text-white mb-4 leading-tight">Insight Reports</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-8">
                Your deep-dive analysis is ready for review.
              </p>
              <div className="mt-auto">
                <Link href="/dashboard/reports" className="btn-primary w-full py-3.5">
                  View Reports
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <SubmitReadingModal
        isOpen={isModalOpen}
        onClose={(refresh) => {
          setIsModalOpen(false);
          if (refresh) router.refresh();
        }}
        user={user}
        appliances={appliances}
      />

      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />
    </motion.div>
  );
}

function KpiCard({ label, value, delta, isPositive, icon: Icon, color, sparklineData }) {
  const colorMap = {
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-purple-500/10',
    amber:  'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-amber-500/10',
    rose:   'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-rose-500/10',
  };

  const strokeMap = {
    purple: '#a855f7',
    amber:  '#f59e0b',
    rose:   '#f43f5e',
  };

  return (
    <SpotlightCard className="p-6 h-full group">
      <div className="flex items-start justify-between mb-6">
        <div className={clsx("w-12 h-12 rounded-2xl border flex items-center justify-center transition-transform group-hover:scale-110", colorMap[color])}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={clsx(
          "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
          isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
        )}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {delta}
        </div>
      </div>
      
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1 truncate">{label}</p>
          <p className="text-3xl font-black text-white tracking-tighter truncate">{value}</p>
        </div>
        
        <div className="w-20 h-10 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={strokeMap[color]} 
                strokeWidth={3} 
                fill="none" 
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </SpotlightCard>
  );
}
