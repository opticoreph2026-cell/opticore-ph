'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Zap, TrendingDown, Plus, 
  ArrowUpRight, ArrowDownRight, MoreHorizontal,
  ChevronRight, Activity, Calendar, Sparkles,
  Droplets, Lightbulb, Wallet, ShieldAlert
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import SubmitReadingModal from '@/components/dashboard/SubmitReadingModal';
import GridStatusBanner from '@/components/dashboard/GridStatusBanner';
import Toast from '@/components/ui/Toast';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { Skeleton } from '@/components/ui/Skeleton';

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

export default function DashboardOverview({ user, readings = [], alerts = [], appliances = [], latestReport = null, lpgStatus = null, waterAnalysis = null, searchParams }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');

  const [attribution, setAttribution] = useState(null);
  const [loadingAttribution, setLoadingAttribution] = useState(false);

  const fetchAttribution = useCallback(async () => {
    setLoadingAttribution(true);
    try {
      const res = await fetch('/api/dashboard/attribution');
      const json = await res.json();
      if (json.success) setAttribution(json.data);
    } catch (e) {
      console.error('Failed to fetch attribution:', e);
    } finally {
      setLoadingAttribution(false);
    }
  }, []);

  useEffect(() => {
    fetchAttribution();
  }, [fetchAttribution]);

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
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4">
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] animate-pulse">
              Live Neural Feedback
            </div>
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{format(new Date(), 'MMMM d, yyyy')}</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tighter leading-none">
            Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">{user?.name?.split(' ')[0] || 'User'}</span>
          </h1>
          <p className="text-slate-500 font-bold mt-4 text-lg">
            Analyzing telemetry for <span className="text-white">{appliances.length} appliances</span> at <span className="text-white underline decoration-cyan-500/30 underline-offset-4">{user.activeProperty?.name || 'Main Home'}</span>.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 px-10 py-5 rounded-2xl bg-white text-surface-1000 font-black text-sm uppercase tracking-[0.2em] hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-all duration-500 group shadow-2xl"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> 
            Add Bill Reading
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <GridStatusBanner />
      </motion.div>

      {/* ── KPI Grid ── */}
      <div className="space-y-10 lg:space-y-20">
        {/* Row 1: Primary Metrics */}
        <div className="space-y-6 lg:space-y-8">
          <div className="flex items-center gap-4 px-1 group">
            <div className="w-1.5 h-6 bg-cyan-500 rounded-full group-hover:scale-y-125 transition-transform duration-500 shadow-[0_0_12px_rgba(34,211,238,0.4)]" />
            <h2 className="text-xs font-black text-white uppercase tracking-[0.4em] drop-shadow-sm transition-colors group-hover:text-cyan-400">Grid Telemetry</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-8">
            <motion.div variants={itemVariants}>
              <KpiCard 
                label="Energy Consumption"
                value={`${latest.kwhUsed || 0} kWh`}
                delta={kwhDelta ? `${kwhDelta}%` : "FIRST READING"}
                isPositive={parseFloat(kwhDelta) < 0}
                icon={Lightbulb}
                color="cyan"
                sparklineData={chartData.slice(-6)}
                dataKey="value"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <KpiCard 
                label="Total Estimated Bill"
                value={`₱${totalBill.toLocaleString(undefined, {minimumFractionDigits: 0})}`}
                delta={billDelta ? `${billDelta}%` : "NEW CYCLE"}
                isPositive={parseFloat(billDelta) < 0}
                icon={Wallet}
                color="amber"
                sparklineData={chartData.slice(-6)}
                dataKey="bill"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <KpiCard 
                label="Effective Rate"
                value={latest.kwhUsed > 0 ? `₱${effectiveRate.toFixed(2)}/kWh` : "—"}
                delta={latest.kwhUsed > 0 ? (effectiveRate <= 16 ? "EFFICIENT" : "HIGH") : "NO DATA"}
                isPositive={effectiveRate <= 16}
                icon={Zap}
                color="cyan"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <KpiCard 
                label="Month-over-Month"
                value={billDelta ? `${billDelta}%` : "—"}
                delta={billDelta ? (parseFloat(billDelta) < 0 ? "DECREASED" : "INCREASED") : "NO PREVIOUS DATA"}
                isPositive={parseFloat(billDelta) < 0}
                icon={TrendingDown}
                color={parseFloat(billDelta) < 0 ? "emerald" : "rose"}
              />
            </motion.div>
          </div>
        </div>

        {/* Row 2: Secondary Metrics */}
        <div className="space-y-6 lg:space-y-8">
          <div className="flex items-center gap-4 px-1 group">
            <div className="w-1.5 h-6 bg-purple-500 rounded-full group-hover:scale-y-125 transition-transform duration-500 shadow-[0_0_12px_rgba(168,85,247,0.4)]" />
            <h2 className="text-xs font-black text-white uppercase tracking-[0.4em] drop-shadow-sm transition-colors group-hover:text-purple-400">Resource Monitoring</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-8">
            <motion.div variants={itemVariants}>
              <KpiCard 
                label="Water Usage"
                value={`${latest.m3Used || 0} m³`}
                delta={waterDelta ? `${waterDelta}%` : "NO SPIKE"}
                isPositive={parseFloat(waterDelta) <= 0}
                icon={Droplets}
                color="blue"
                sparklineData={chartData.slice(-6)}
                dataKey="water"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <KpiCard 
                label="LPG Status"
                value={lpgStatus?.percentLeft != null ? `${lpgStatus.percentLeft.toFixed(0)}%` : "—"}
                delta={lpgStatus ? (lpgStatus.daysLeft > 0 ? `${lpgStatus.daysLeft} days left` : "REFILL NEEDED") : "NO LPG DATA"}
                isPositive={lpgStatus?.percentLeft > 15}
                icon={Zap}
                color={lpgStatus?.percentLeft <= 15 ? "amber" : "cyan"}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <KpiCard 
                label="Ghost Load"
                value={attribution?.electric?.discrepancy?.percentage != null ? `${attribution.electric.discrepancy.percentage}%` : "CALCULATING..."}
                delta={attribution?.electric?.severity || "MONITORING"}
                isPositive={attribution?.electric?.severity === 'NORMAL'}
                icon={Activity}
                color={attribution?.electric?.severity === 'CRITICAL' ? "rose" : "purple"}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <KpiCard 
                label="Active Alerts"
                value={alerts.length}
                delta={alerts.length === 0 ? "SYSTEM HEALTHY" : `${alerts.filter(a => a.severity === 'critical').length} CRITICAL`}
                isPositive={alerts.length === 0}
                icon={ShieldAlert}
                color={alerts.length > 0 ? "rose" : "emerald"}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Visual Insights Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Load Attribution Donut */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <SpotlightCard className="p-8 h-full bg-surface-1000/20 backdrop-blur-md">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-white tracking-tighter">Load Attribution</h3>
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attribution?.electric?.categories ? Object.entries(attribution.electric.categories).map(([name, obj]) => ({
                      name, value: obj.value
                    })) : [{name: 'Loading', value: 100}]}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(attribution?.electric?.categories ? Object.keys(attribution.electric.categories) : ['#333']).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#22d3ee', '#818cf8', '#a78bfa', '#f472b6', '#fb7185'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-surface-900 border border-white/10 rounded-xl p-3 shadow-2xl">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{payload[0].name}</p>
                          <p className="text-sm font-black text-white">{payload[0].value.toFixed(1)} kWh</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Theoretical</p>
                <p className="text-xl font-black text-white">{attribution?.electric?.totalEstimated || 0}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
               <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                 <span className="text-slate-500">Unexplained (Ghost)</span>
                 <span className="text-rose-400">{attribution?.electric?.discrepancy?.value || 0} kWh</span>
               </div>
               <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-rose-500 transition-all duration-1000" 
                   style={{ width: `${attribution?.electric?.discrepancy?.percentage || 0}%` }}
                 />
               </div>
            </div>
          </SpotlightCard>
        </motion.div>

        {/* Water Pulse BarChart */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <SpotlightCard className="p-8 h-full bg-surface-1000/20 backdrop-blur-md">
             <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-white tracking-tighter">Water Pulse</h3>
              <Droplets className="w-4 h-4 text-blue-400" />
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.slice(-6)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.03)'}}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-surface-900 border border-white/10 rounded-xl p-3 shadow-2xl">
                          <p className="text-sm font-black text-white">{payload[0].value} m³</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="water" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest mt-4">
              6-Month Consumption Trend
            </p>
          </SpotlightCard>
        </motion.div>

        {/* LPG Depletion Gauge */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <SpotlightCard className="p-8 h-full bg-surface-1000/20 backdrop-blur-md">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-white tracking-tighter">LPG Depletion</h3>
              <Activity className="w-4 h-4 text-orange-400" />
            </div>
            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { value: lpgStatus?.percentLeft || 0 },
                      { value: 100 - (lpgStatus?.percentLeft || 0) }
                    ]}
                    cx="50%"
                    cy="80%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    <Cell fill={lpgStatus?.percentLeft < 15 ? '#fb7185' : '#f59e0b'} />
                    <Cell fill="rgba(255,255,255,0.05)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-16 pointer-events-none">
                <p className="text-4xl font-black text-white leading-none">{lpgStatus?.percentLeft?.toFixed(0) || 0}%</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">Inventory Left</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Est. Refill</p>
                <p className="text-sm font-black text-white">{lpgStatus?.daysLeft || 0} Days</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Burn Rate</p>
                <p className="text-sm font-black text-white">{lpgStatus?.dailyBurnRate?.toFixed(2) || 0} kg/d</p>
              </div>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>

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

function AnimatedValue({ value }) {
  // Try to parse the numeric part and string parts
  const match = typeof value === 'string' ? value.match(/^([^\d-]*)([-]?\d+(?:,\d+)*(?:\.\d+)?)(.*)$/) : null;
  
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (!match) {
      setDisplayValue(value);
      return;
    }
    const prefix = match[1];
    const numStr = match[2].replace(/,/g, '');
    const suffix = match[3];
    const num = parseFloat(numStr);
    
    if (isNaN(num)) {
      setDisplayValue(value);
      return;
    }

    const startValue = 0;
    const duration = 1.5;
    
    // Quick custom animation using requestAnimationFrame
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentNum = startValue + easeProgress * (num - startValue);
      
      // format appropriately
      let formattedNum = currentNum.toFixed(numStr.includes('.') ? numStr.split('.')[1].length : 0);
      if (match[2].includes(',')) {
        formattedNum = parseFloat(formattedNum).toLocaleString(undefined, {
          minimumFractionDigits: numStr.includes('.') ? numStr.split('.')[1].length : 0,
          maximumFractionDigits: numStr.includes('.') ? numStr.split('.')[1].length : 0
        });
      }
      
      setDisplayValue(`${prefix}${formattedNum}${suffix}`);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value); // Ensure exact final value
      }
    };
    window.requestAnimationFrame(step);
  }, [value, match]);

  return <span>{displayValue}</span>;
}

function KpiCard({ label, value, delta, isPositive, icon: Icon, color, sparklineData, dataKey, isLoading }) {
  const colorMap = {
    cyan:    'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    blue:    'text-blue-400 bg-blue-500/10 border-blue-500/20',
    amber:   'text-amber-400 bg-amber-500/10 border-amber-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    rose:    'text-rose-400 bg-rose-500/10 border-rose-500/20',
    purple:  'text-purple-400 bg-purple-500/10 border-purple-500/20',
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
    <SpotlightCard className="p-8 h-full group hover:border-white/20 transition-all duration-700 relative overflow-hidden bg-surface-950/40 backdrop-blur-3xl">
      {/* Decorative gradient glow */}
      <div className={clsx(
        "absolute -top-24 -right-24 w-48 h-48 blur-[100px] opacity-0 group-hover:opacity-20 transition-opacity duration-700",
        color === 'cyan' && "bg-cyan-500",
        color === 'amber' && "bg-amber-500",
        color === 'purple' && "bg-purple-500",
        color === 'rose' && "bg-rose-500"
      )} />

      <div className="flex items-start justify-between mb-10">
        <div className={clsx("w-14 h-14 rounded-2xl border flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]", colorMap[color])}>
          <Icon className="w-7 h-7" />
        </div>
        <div className={clsx(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border transition-all duration-700",
          isLoading ? "bg-white/5 border-white/10" : (isPositive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20")
        )}>
          {isLoading ? <Skeleton className="h-3 w-16" /> : (
            <>
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {delta}
            </>
          )}
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{label}</p>
        <div className="flex items-end justify-between gap-4">
          <p className="text-4xl font-black text-white tracking-tighter leading-none group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/50 transition-all duration-700">
            {isLoading ? <Skeleton className="h-9 w-24" /> : <AnimatedValue value={value} />}
          </p>
          
          {sparklineData && (
            <div className="w-24 h-10 opacity-30 group-hover:opacity-100 transition-opacity duration-700">
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
          )}
        </div>
      </div>
    </SpotlightCard>
  );
}
