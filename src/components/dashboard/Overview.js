'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { 
  Zap, TrendingDown, Plus, 
  ArrowUpRight, ArrowDownRight, MoreHorizontal,
  ChevronRight, Activity, Calendar, Sparkles,
  Droplets, Lightbulb, Wallet, ShieldAlert
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
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

export default function DashboardOverview({ user, readings = [], alerts = [], appliances = [], searchParams }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    if (searchParams?.upgraded === 'true') {
      const planName = searchParams?.plan || 'Pro';
      setToastMsg(`Successfully upgraded to ${planName} plan!`);
      setToastType('success');
      // Clean up URL without reload
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams]);

  const latest = readings[0] || {};
  const previous = readings[1] || {};
  
  const totalBill = (latest.billAmountElectric ?? 0) + (latest.billAmountWater ?? 0);
  const prevTotalBill = (previous.billAmountElectric ?? 0) + (previous.billAmountWater ?? 0);
  
  const billDelta = useMemo(() => {
    if (!totalBill || !prevTotalBill) return null;
    return ((totalBill - prevTotalBill) / prevTotalBill * 100).toFixed(1);
  }, [totalBill, prevTotalBill]);

  const kwhDelta = useMemo(() => {
    if (!latest.kwhUsed || !previous.kwhUsed) return null;
    return (((latest.kwhUsed - previous.kwhUsed) / previous.kwhUsed) * 100).toFixed(1);
  }, [latest.kwhUsed, previous.kwhUsed]);

  const waterDelta = useMemo(() => {
    if (!latest.m3Used || !previous.m3Used) return null;
    return (((latest.m3Used - previous.m3Used) / previous.m3Used) * 100).toFixed(1);
  }, [latest.m3Used, previous.m3Used]);

  const effectiveRate = useMemo(() => {
    if (!latest.kwhUsed) return 0;
    return (latest.billAmountElectric / latest.kwhUsed);
  }, [latest.kwhUsed, latest.billAmountElectric]);

  const chartData = useMemo(() => {
    if (!readings || readings.length === 0) {
      return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => ({ name: m, value: 0, water: 0, bill: 0 }));
    }
    
    const groups = {};
    [...readings].forEach(r => {
      const date = parseISO(r.readingDate);
      const monthKey = format(date, 'yyyy-MM');
      if (!groups[monthKey]) {
        groups[monthKey] = { 
          name: format(date, 'MMM'), 
          fullDate: date, 
          value: r.kwhUsed ?? 0, 
          water: r.m3Used ?? 0, 
          bill: (r.billAmountElectric ?? 0) + (r.billAmountWater ?? 0) 
        };
      }
    });

    return Object.values(groups)
      .sort((a, b) => a.fullDate - b.fullDate)
      .slice(-12);
  }, [readings]);

  const intelligenceSummary = useMemo(() => {
    if (alerts.length > 0) {
      const critical = alerts.filter(a => a.severity === 'critical');
      if (critical.length > 0) return `You have ${critical.length} items needing attention today.`;
      return `You have ${alerts.length} new energy insights.`;
    }
    return "Your home is running efficiently. No issues detected.";
  }, [alerts]);

  // Empty State Logic
  if (readings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <Zap className="w-10 h-10 text-cyan-400 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white tracking-tighter">Dashboard Offline</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Submit your first reading to see your dashboard come alive with AI insights and telemetry.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary px-8 py-4 text-xs font-black uppercase tracking-widest"
        >
          Add Your First Reading
        </button>

        <SubmitReadingModal
          isOpen={isModalOpen}
          onClose={(refresh) => {
            setIsModalOpen(false);
            if (refresh) router.refresh();
          }}
          user={user}
          appliances={appliances}
        />
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 lg:p-0 space-y-8 pb-20"
    >
      {/* ── Welcome Header ── */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black text-cyan-400 uppercase tracking-widest">
              Live Feedback Active
            </div>
            <span className="text-xs text-slate-500 font-bold">•</span>
            <span className="text-xs text-slate-500 font-bold">{format(new Date(), 'MMMM d, yyyy')}</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">
            Welcome Back, <span className="text-cyan-400">{user?.name?.split(' ')[0] || 'User'}</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Managing <span className="text-white font-black">{appliances.length} appliances</span> at your <span className="text-white font-black">{user.activeProperty?.name || 'Main Property'}</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-cyan-500 text-surface-1000 font-black text-sm uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_8px_32px_rgba(34,211,238,0.3)] group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> 
            Add Bill Reading
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <GridStatusBanner />
      </motion.div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. Energy Consumption */}
        <motion.div variants={itemVariants}>
          <KpiCard 
            label="Energy Consumption"
            value={`${latest.kwhUsed || 0} kWh`}
            delta={kwhDelta ? `${kwhDelta}%` : "First reading"}
            isPositive={parseFloat(kwhDelta) < 0}
            icon={Lightbulb}
            color="cyan"
            sparklineData={chartData.slice(-6)}
            dataKey="value"
          />
        </motion.div>

        {/* 2. Total Estimated Bill */}
        <motion.div variants={itemVariants}>
          <KpiCard 
            label="Total Estimated Bill"
            value={`₱${totalBill.toLocaleString(undefined, {minimumFractionDigits: 2})}`}
            delta={billDelta ? `${billDelta}%` : "New cycle"}
            isPositive={parseFloat(billDelta) < 0}
            icon={Wallet}
            color="amber"
            sparklineData={chartData.slice(-6)}
            dataKey="bill"
          />
        </motion.div>

        {/* 3. Effective Rate */}
        <motion.div variants={itemVariants}>
          <KpiCard 
            label="Effective Rate"
            value={latest.kwhUsed > 0 ? `₱${effectiveRate.toFixed(2)}/kWh` : "—"}
            delta={latest.kwhUsed > 0 ? (effectiveRate <= 16 ? "Efficient" : "High") : "No data"}
            isPositive={effectiveRate <= 16}
            icon={Zap}
            color="cyan"
          />
        </motion.div>

        {/* 4. MoM Change */}
        <motion.div variants={itemVariants}>
          <KpiCard 
            label="Month-over-Month"
            value={billDelta ? `${billDelta}%` : "—"}
            delta={billDelta ? (parseFloat(billDelta) < 0 ? "Decreased" : "Increased") : "No previous data"}
            isPositive={parseFloat(billDelta) < 0}
            icon={TrendingDown}
            color={parseFloat(billDelta) < 0 ? "emerald" : "rose"}
          />
        </motion.div>

        {/* 5. Water Usage */}
        <motion.div variants={itemVariants}>
          <KpiCard 
            label="Water Usage"
            value={`${latest.m3Used || 0} m³`}
            delta={waterDelta ? `${waterDelta}%` : "No spike"}
            isPositive={parseFloat(waterDelta) <= 0}
            icon={Droplets}
            color="blue"
            sparklineData={chartData.slice(-6)}
            dataKey="water"
          />
        </motion.div>

        {/* 6. LPG Status */}
        <motion.div variants={itemVariants}>
          <KpiCard 
            label="LPG Status"
            value={lpgStatus?.percentLeft != null ? `${lpgStatus.percentLeft.toFixed(0)}%` : "—"}
            delta={lpgStatus ? (lpgStatus.daysLeft > 0 ? `${lpgStatus.daysLeft} days left` : "Refill needed") : "No LPG data"}
            isPositive={lpgStatus?.percentLeft > 15}
            icon={Zap}
            color={lpgStatus?.percentLeft <= 15 ? "amber" : "cyan"}
          />
        </motion.div>

        {/* 7. Ghost Load % */}
        <motion.div variants={itemVariants}>
          <KpiCard 
            label="Ghost Load"
            value="Coming Soon"
            delta="Analysis pending"
            isPositive={true}
            icon={Activity}
            color="purple"
          />
        </motion.div>

        {/* 8. Active Alerts */}
        <motion.div variants={itemVariants}>
          <KpiCard 
            label="Active Alerts"
            value={alerts.length}
            delta={alerts.length === 0 ? "System healthy" : `${alerts.filter(a => a.severity === 'critical').length} critical`}
            isPositive={alerts.length === 0}
            icon={ShieldAlert}
            color={alerts.length > 0 ? "rose" : "emerald"}
          />
        </motion.div>
      </div>

      {/* ── Consumption Visualizer ── */}
      <motion.div variants={itemVariants}>
        <SpotlightCard className="p-8 bg-surface-1000/20 backdrop-blur-md">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-white tracking-tighter">Your Spending History</h3>
              <p className="text-sm text-slate-500 mt-1">Comparing your monthly combined utility costs</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              12-Month Analytics
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 10}}
                  tickFormatter={(v) => `₱${v}`}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-surface-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl min-w-[180px]">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{label} Total</p>
                        <p className="text-xl font-black text-white">₱{payload[0].value.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-tighter">AI Analysis Ready</span>
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                        </div>
                      </div>
                    );
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="bill" 
                  stroke="#22d3ee" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorBill)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>
      </motion.div>

      {/* ── Intelligence Row ── */}
      <div className="grid grid-cols-12 gap-6">
        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-8">
          <SpotlightCard className="p-8 h-full bg-surface-1000/20 backdrop-blur-md">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-white tracking-tighter flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
                AI Savings Coach
              </h3>
              <Link href="/dashboard/alerts" className="text-[10px] font-black text-cyan-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 group">
                Review My Advice <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="flex flex-col items-center justify-center py-10 text-center relative">
              <div className="absolute inset-0 bg-cyan-500/5 blur-[60px] rounded-full pointer-events-none" />
              <p className="text-xl font-bold text-white max-w-md relative z-10 leading-snug">
                "{intelligenceSummary}"
              </p>
              <div className="mt-6 flex items-center gap-3 bg-white/[0.03] border border-white/5 px-4 py-2 rounded-full relative z-10">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Gemini Pro Auditing System
                </p>
              </div>
            </div>
          </SpotlightCard>
        </motion.div>

        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-4">
          <div className="bento-card p-10 bg-gradient-to-br from-cyan-600/20 via-blue-600/10 to-transparent border-white/10 h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/20 transition-all duration-1000" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-2xl">
                <Calendar className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-3xl font-black text-white mb-4 leading-tight tracking-tighter">Your Financial Reports</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-10 font-medium">
                Deep-dive into your spending habits and find exactly where you can save more money this month.
              </p>
              <div className="mt-auto">
                <Link href="/dashboard/reports" className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-white text-surface-1000 font-black text-sm uppercase tracking-widest hover:bg-cyan-400 transition-all">
                  Open Analysis
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

      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />
    </motion.div>
  );
}

function KpiCard({ label, value, delta, isPositive, icon: Icon, color, sparklineData, dataKey }) {
  const colorMap = {
    cyan:    'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 shadow-cyan-500/10',
    blue:    'text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-blue-500/10',
    amber:   'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-amber-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10',
    rose:    'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-rose-500/10',
    purple:  'text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-purple-500/10',
  };

  const strokeMap = {
    cyan:    '#22d3ee',
    blue:    '#3b82f6',
    amber:   '#f59e0b',
    emerald: '#10b981',
    rose:    '#f43f5e',
    purple:  '#8b5cf6',
  };

  return (
    <SpotlightCard className="p-8 h-full group hover:border-white/20 transition-all duration-500">
      <div className="flex items-start justify-between mb-8">
        <div className={clsx("w-14 h-14 rounded-[20px] border flex items-center justify-center transition-all duration-500 group-hover:rotate-6 shadow-2xl", colorMap[color])}>
          <Icon className="w-7 h-7" />
        </div>
        <div className={clsx(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-500",
          isPositive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
        )}>
          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {delta}
        </div>
      </div>
      
      <div className="flex items-end justify-between gap-6">
        <div className="min-w-0">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-2 truncate">{label}</p>
          <p className="text-3xl font-black text-white tracking-tighter truncate leading-none">{value}</p>
        </div>
        
        <div className="w-24 h-12 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <Area 
                type="monotone" 
                dataKey={dataKey} 
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
