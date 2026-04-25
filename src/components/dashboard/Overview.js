'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Zap, Droplets, TrendingDown, Users, Plus, 
  ArrowUpRight, ArrowDownRight, MoreHorizontal,
  ChevronRight, Activity, Calendar, Sparkles
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import SubmitReadingModal from '@/components/dashboard/SubmitReadingModal';
import GridStatusBanner from '@/components/dashboard/GridStatusBanner';
import Toast from '@/components/ui/Toast';
import SpotlightCard from '@/components/ui/SpotlightCard';

const PIE_COLORS = ['#22d3ee', '#a855f7', '#6366f1', '#f59e0b'];

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
    return [...readings]
      .reverse()
      .slice(-12)
      .map(r => ({
        name: r.readingDate ? format(parseISO(r.readingDate), 'MMM') : '—',
        value: r.kwhUsed ?? 0,
        water: r.m3Used ?? 0,
        bill: (r.billAmountElectric ?? 0) + (r.billAmountWater ?? 0)
      }));
  }, [readings]);

  const breakdownData = [
    { name: 'Cooling', value: 45 },
    { name: 'Lighting', value: 20 },
    { name: 'Appliances', value: 25 },
    { name: 'Other', value: 10 },
  ];

  const recentActivity = [
    { id: 1, type: 'Bill Logged', user: 'Admin', date: '2 mins ago' },
    { id: 2, type: 'Appliance Linked', user: 'Admin', date: '1 hour ago' },
    { id: 3, type: 'Alert Resolved', user: 'System', date: '4 hours ago' },
    { id: 4, type: 'Report Generated', user: 'Admin', date: '1 day ago' },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 lg:p-0 space-y-8"
    >
      {/* ── Hero Section (Merged Welcome & Managed Assets) ── */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bento-card p-8 lg:p-10 bg-gradient-to-br from-white/[0.03] to-transparent">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-display text-3xl lg:text-4xl font-black text-white tracking-tight">
                Systems Online, {user?.name?.split(' ')[0] ?? 'User'}.
              </h1>
              <p className="text-slate-500 font-medium mt-2 max-w-md">
                Your resource footprint is being monitored across <span className="text-cyan-400">{appliances.length} managed assets</span>.
              </p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" /> Log Reading
            </button>
          </div>
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
            label="Est. Monthly Bill"
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
            label="Network Health"
            value="98.2%"
            delta="Stable"
            isPositive={true}
            icon={Activity}
            color="rose"
            sparklineData={chartData.slice(-6)}
          />
        </motion.div>
      </div>

      {/* ── Row 2: Main Insights ── */}
      <div className="grid grid-cols-12 gap-6">
        {/* Main Chart */}
        <motion.div variants={itemVariants} className="col-span-12 xl:col-span-8">
          <SpotlightCard className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-display text-xl font-black text-white">Consumption Protocol</h3>
                <p className="text-sm text-slate-500 mt-1">Holistic utility trends over the last cycle</p>
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

        {/* Donut Chart */}
        <motion.div variants={itemVariants} className="col-span-12 xl:col-span-4">
          <SpotlightCard className="p-8 h-full flex flex-col">
            <h3 className="text-display text-xl font-black text-white mb-2">Attribution</h3>
            <p className="text-sm text-slate-500 mb-8">Load distribution</p>
            
            <div className="flex-1 flex flex-col items-center justify-center relative">
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdownData}
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={10}
                      dataKey="value"
                    >
                      {breakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-3xl font-black text-white">82%</p>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Load</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {breakdownData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{item.name}</span>
                </div>
              ))}
            </div>
          </SpotlightCard>
        </motion.div>
      </div>

      {/* ── Row 3: Activity & Intelligence ── */}
      <div className="grid grid-cols-12 gap-6">
        {/* Activity Table */}
        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-8">
          <SpotlightCard className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-display text-xl font-black text-white">Event Log</h3>
              <Link href="/dashboard/reports" className="text-[10px] font-black text-cyan-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
                Audit Trail <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((act) => (
                <div key={act.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{act.type}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{act.user}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 font-mono">{act.date}</p>
                </div>
              ))}
            </div>
          </SpotlightCard>
        </motion.div>

        {/* Intelligence Upsell (Integrated) */}
        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-4">
          <div className="bento-card p-8 bg-gradient-to-br from-brand-secondary/20 to-brand-primary/20 border-white/10 h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-display text-2xl font-black text-white mb-4 leading-tight">Elite Prediction</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-8">
                Unlock autonomous mapping of your appliance ROI and energy leak detection.
              </p>
              <Link href="/dashboard/appliances" className="btn-primary w-full py-3.5">
                Go Premium
              </Link>
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
    <SpotlightCard className="p-6 h-full">
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
        <div>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">{label}</p>
          <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
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
