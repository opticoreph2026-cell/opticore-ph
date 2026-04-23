'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { Zap, Droplets, TrendingDown, Bell, FileText, TriangleAlert, Cpu, Plus, Activity } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import SubmitReadingModal from '@/components/dashboard/SubmitReadingModal';
import SubmitLpgModal from '@/components/dashboard/SubmitLpgModal';
import CatalogSearch from '@/components/dashboard/CatalogSearch';
import ForecastWidget from '@/components/dashboard/ForecastWidget';
import GhostLoadChart from '@/components/dashboard/GhostLoadChart';
import UsageHeatmap from '@/components/dashboard/UsageHeatmap';
import DailyTracker from '@/components/dashboard/DailyTracker';
import GridStatusBanner from '@/components/dashboard/GridStatusBanner';
import Toast from '@/components/ui/Toast';

/**
 * Client-side dashboard overview.
 * Receives server-fetched data as props.
 */
export default function DashboardOverview({ user, readings, alerts, appliances = [], latestReport = null, lpgStatus = null, waterAnalysis = null }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLpgModalOpen, setIsLpgModalOpen] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('info');

  // Latest reading — report now comes directly as its own prop
  const latest = readings[0] || {};
  const activeReport = latestReport; // Fix: was readings[0]?.report which never existed
  
  // Safe JSON parsing for multi-utility recommendations
  let reportData = null;
  try {
    if (activeReport?.recommendations) {
      reportData = JSON.parse(activeReport.recommendations);
    }
  } catch (e) {
    console.error('Report parsing failed', e);
  }

  // Link Appliance — add catalog item to user's appliance profile
  const handleLinkAppliance = async (item) => {
    setIsLinking(true);
    try {
      const response = await fetch('/api/dashboard/appliances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${item.brand} ${item.modelNumber}`,
          category: item.category.toLowerCase(),
          brand: item.brand,
          model: item.modelNumber,
          wattage: item.wattage,
          energy_rating: item.eerRating ? `${item.eerRating} EER` : 'not-rated',
          notes: `Linked from OptiCore Engineering Catalog. Cooling Capacity: ${item.coolingCapacityKjH} kJ/h.`,
        }),
      });

      if (response.ok) {
        router.refresh(); // Fix: was window.location.reload() — breaks SSR
        setToastMsg('Appliance added to your profile!');
        setToastType('success');
      } else {
        const err = await response.json();
        setToastMsg(err.error || 'Failed to link appliance');
        setToastType('error');
      }
    } catch (err) {
      setToastMsg('Network error. Failed to link appliance.');
      setToastType('error');
    } finally {
      setIsLinking(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/report', { method: 'POST' });
      const json = await response.json();
      if (json.success) {
        router.refresh(); // Fix: was window.location.reload()
      } else {
        setToastMsg(json.message || 'Failed to generate report.');
        setToastType('error');
      }
    } catch (err) {
      setToastMsg('Analysis failed. Ensure you have submitted readings and profiled appliances.');
      setToastType('error');
    } finally {
      setIsGenerating(false);
    }
  };
  const chartData = [...readings]
    .reverse()
    .slice(-6)
    .map((r) => ({
      month:    r.readingDate ? format(parseISO(r.readingDate), 'MMM yy') : '—',
      kWh:      r.kwhUsed   ?? 0,
      m3:       r.m3Used    ?? 0,
      electric: r.billAmountElectric ?? 0,
      water:    r.billAmountWater    ?? 0,
    }));

  // Latest reading stats
  const previous  = readings[1] || {};
  const kwhDelta  = latest.kwhUsed
    ? ((latest.kwhUsed - (previous.kwhUsed ?? latest.kwhUsed)) / (previous.kwhUsed || 1) * 100).toFixed(1)
    : null;

  const totalBill = (latest.billAmountElectric ?? 0) + (latest.billAmountWater ?? 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  };

  return (
    <motion.div 
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >

      <GridStatusBanner />

      {/* ── Page Header ───────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <div>
          <p className="section-label mb-1">Energy Intelligence</p>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Welcome back, <span className="shimmer-text">{user?.name?.split(' ')[0] ?? 'User'}</span>
          </h1>
          <p className="text-[11px] text-text-muted mt-0.5 font-medium opacity-80">
            Monitoring {new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })} consumption metrics.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary inline-flex items-center gap-2 text-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Log Bill Data
        </button>
      </motion.div>

      <SubmitReadingModal
        isOpen={isModalOpen}
        onClose={(refresh) => {
          setIsModalOpen(false);
          if (refresh) router.refresh();
        }}
        user={user}
        appliances={appliances}
      />

      <SubmitLpgModal
        isOpen={isLpgModalOpen}
        onClose={(refresh) => {
          setIsLpgModalOpen(false);
          if (refresh) router.refresh();
        }}
      />

      {/* ── KPI Row ───────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 xl:grid-cols-4 gap-3.5">
        <KpiCard
          icon={Zap} iconColor="text-brand-400" iconBg="bg-brand-500/15" iconBorderColor="border-brand-500/25"
          label="Electricity" value={latest.kwhUsed ? latest.kwhUsed.toLocaleString() : '—'} unit="kWh"
          delta={kwhDelta} deltaLabel="vs last month"
        />
        <KpiCard
          icon={Droplets} iconColor="text-blue-400" iconBg="bg-blue-500/10" iconBorderColor="border-blue-500/20"
          label="Water" value={latest.m3Used ?? '—'} unit="m³"
        />
        <KpiCard
          icon={TrendingDown} iconColor="text-emerald-400" iconBg="bg-emerald-500/15" iconBorderColor="border-emerald-500/25"
          label="Total Bill" value={totalBill ? `₱${totalBill.toLocaleString()}` : '₱—'}
        />
        <KpiCard
          icon={Bell} iconColor="text-orange-400" iconBg="bg-orange-500/15" iconBorderColor="border-orange-500/25"
          label="Active Alerts" value={alerts.length.toString()}
          badge={alerts.some(a => a.severity === 'critical') ? 'CRITICAL' : null}
        />
      </motion.div>

      {/* ── Main Bento Grid ───────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-12 gap-4 lg:gap-6">

        {/* Row 1: Usage Trends & Intelligence (The "Meat") */}
        <div className="col-span-12 lg:col-span-8 bento-card p-6 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="section-label mb-1">Consumption History</p>
              <h2 className="font-bold text-text-primary text-xl">Usage Intelligence Trends</h2>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-black uppercase tracking-[0.15em] text-brand-500/80 bg-brand-500/5 px-3 py-1.5 rounded-full border border-brand-500/10">
                 Real-time Engine
               </span>
            </div>
          </div>
          <div className="flex-1 min-h-[280px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="kwhGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="m3Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600 }} 
                    axisLine={false} 
                    tickLine={false}
                    dy={12}
                  />
                  <YAxis 
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} 
                    axisLine={false} 
                    tickLine={false} 
                    width={40}
                  />
                  <Tooltip
                    cursor={{ stroke: 'rgba(245,158,11,0.3)', strokeWidth: 2 }}
                    contentStyle={{
                      background: 'rgba(10,10,15,0.95)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 20, fontSize: 12, color: '#fff',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                      padding: '16px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="kWh" 
                    stroke="#f59e0b" 
                    strokeWidth={4} 
                    fill="url(#kwhGrad)" 
                    name="Power (kWh)" 
                    dot={{ r: 5, fill: '#f59e0b', strokeWidth: 2, stroke: '#0a0a0f' }} 
                    activeDot={{ r: 8, fill: '#f59e0b', strokeWidth: 3, stroke: '#fff', boxShadow: '0 0 20px rgba(245,158,11,0.5)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="m3"  
                    stroke="#60a5fa" 
                    strokeWidth={3} 
                    fill="url(#m3Grad)"  
                    name="Water (m³)" 
                    dot={{ r: 5, fill: '#60a5fa', strokeWidth: 2, stroke: '#0a0a0f' }} 
                    activeDot={{ r: 8, fill: '#60a5fa', strokeWidth: 3, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={FileText} message="No readings yet. Submit your first month to see trends." />
            )}
          </div>
        </div>

        {/* Intelligence Engine — 4 cols */}
        <div className="col-span-12 lg:col-span-4 bento-card p-6 flex flex-col h-full bg-gradient-to-br from-brand-500/[0.03] to-transparent">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="section-label mb-1">OptiCore AI</p>
              <h2 className="font-bold text-text-primary text-lg flex items-center gap-2">
                <Cpu className="w-5 h-5 text-brand-400" />
                Attribution Analysis
              </h2>
            </div>
            {readings.length > 0 && (
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 hover:bg-brand-500/20 transition-all disabled:opacity-40"
              >
                <Activity className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : ''}`} />
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            {readings.length > 0 ? (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] relative min-h-[140px] flex items-center">
                  <span className="absolute -top-1 left-3 text-5xl text-brand-500/10 font-serif select-none leading-none">"</span>
                  <p className="text-sm text-text-secondary leading-relaxed italic z-10">
                    {activeReport?.summary || 'Attribution engine idle. Refresh to analyze current footprint.'}
                  </p>
                </div>
                
                {reportData && (
                  <div className="grid grid-cols-1 gap-2.5">
                    {reportData.electric && (
                      <div className={`p-3 rounded-xl border flex items-center justify-between gap-3
                        ${reportData.electric.severity === 'CRITICAL' ? 'bg-red-500/5 border-red-500/10 text-red-400' : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'}`}>
                        <div className="flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Electric Efficiency</span>
                        </div>
                        <span className="text-xs font-black">{reportData.electric.discrepancy.percentage}%</span>
                      </div>
                    )}
                    {reportData.water && (
                      <div className={`p-3 rounded-xl border flex items-center justify-between gap-3
                        ${reportData.water.severity === 'CRITICAL' ? 'bg-red-500/5 border-red-500/10 text-red-400' : 'bg-blue-500/5 border-blue-500/10 text-blue-400'}`}>
                        <div className="flex items-center gap-2">
                          <Droplets className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Hydraulic Guard</span>
                        </div>
                        <span className="text-xs font-black">{reportData.water.discrepancy.percentage}%</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <EmptyState icon={Cpu} message="AI Insights lock until first bill data is parsed." />
            )}
          </div>
          
          <Link href="/dashboard/appliances" className="mt-6 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-center text-text-muted hover:text-brand-400 hover:border-brand-500/20 transition-all">
            Audit Footprint
          </Link>
        </div>

        {/* Row 2: Secondary Insights (Full Width Breakdown) */}
        <div className="col-span-12 lg:col-span-3">
          <DailyTracker />
        </div>

        <div className="col-span-12 lg:col-span-9">
          <UsageHeatmap readings={readings} plan={user?.planTier || 'starter'} />
        </div>

        {/* Row 3: Pro Modules & Database (Balanced Grid) */}
        <div className="col-span-12 lg:col-span-4 bento-card p-6 border-blue-500/20 relative overflow-hidden group">
          {user?.planTier === 'starter' && <LockedFeatureOverlay featureName="Water Leak Detector" />}
          <div className={`flex flex-col h-full ${user?.planTier === 'starter' ? 'blur-md opacity-40 select-none' : ''}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/10">
                <Droplets className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Hydraulic Guard</h3>
                <p className="text-[10px] text-blue-300/60 uppercase font-black tracking-widest">Active Monitoring</p>
              </div>
            </div>
            <div className="p-5 bg-blue-950/20 rounded-2xl border border-blue-500/10 flex-1 flex flex-col justify-center">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Detection Status</p>
              <p className="text-2xl font-black text-white">
                {waterAnalysis?.hasLeak ? 'Leak Detected' : 'Flow Normal'}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 bg-blue-500/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: waterAnalysis ? '100%' : '20%' }} />
                </div>
                <span className="text-[10px] font-bold text-blue-300">{waterAnalysis?.jump ?? 0}% Dev</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bento-card p-6 border-red-500/20 relative overflow-hidden group">
          {user?.planTier === 'starter' && <LockedFeatureOverlay featureName="LPG Depletion Predictor" />}
          <div className={`flex flex-col h-full ${user?.planTier === 'starter' ? 'blur-md opacity-40 select-none' : ''}`}>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shadow-lg shadow-red-500/10">
                  <TrendingDown className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">LPG Predictor</h3>
                  <p className="text-[10px] text-red-300/60 uppercase font-black tracking-widest">Thermodynamic Scan</p>
                </div>
              </div>
              <button onClick={() => setIsLpgModalOpen(true)} className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 bg-red-950/20 rounded-2xl border border-red-500/10 flex-1 flex flex-col justify-center">
              {lpgStatus ? (
                <>
                  <div className="flex justify-between items-baseline mb-2">
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Fuel Reserve</p>
                    <p className="text-lg font-black text-white">{lpgStatus.daysLeft ?? 0} Days</p>
                  </div>
                  <div className="w-full bg-red-500/10 rounded-full h-2">
                    <div className="h-full bg-red-500 rounded-full transition-all duration-1000" style={{ width: `${lpgStatus.percentLeft ?? 0}%` }} />
                  </div>
                  <p className="text-[9px] text-red-300/40 mt-3 uppercase tracking-tighter">Projected Empty: {lpgStatus.estimatedDate}</p>
                </>
              ) : (
                <p className="text-xs text-text-muted text-center italic">Awaiting Tank Calibration</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bento-card p-6 group !overflow-visible z-10 focus-within:z-50 border-brand-500/20">
           <div className="flex flex-col h-full gap-5">
            <div>
              <p className="section-label mb-1">Catalog Sync</p>
              <h2 className="font-bold text-text-primary text-lg flex items-center gap-2">
                <Cpu className="w-5 h-5 text-brand-400" />
                Asset Matchmaker
              </h2>
            </div>
            <div className="relative flex-1 bg-surface-900/50 rounded-2xl border border-white/[0.05] p-1">
              <CatalogSearch onSelect={handleLinkAppliance} />
              {isLinking && (
                <div className="absolute inset-0 bg-surface-950/90 backdrop-blur-md flex items-center justify-center z-[60] rounded-2xl">
                  <Activity className="w-5 h-5 text-brand-400 animate-spin" />
                </div>
              )}
            </div>
            <p className="text-[10px] text-text-muted text-center italic px-4">
              Match your model for 99.8% wattage precision.
            </p>
          </div>
        </div>

        {/* Row 4: Specialized Data (Full & Split) */}
        <div className="col-span-12 lg:col-span-7">
          <GhostLoadChart plan={user?.planTier || 'starter'} />
        </div>

        <div className="col-span-12 lg:col-span-5 bento-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="section-label mb-1">Security & Health</p>
              <h2 className="font-bold text-text-primary text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-400" />
                Recent Alerts
              </h2>
            </div>
            <Link href="/dashboard/alerts" className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-brand-400 transition-colors">
              View Feed
            </Link>
          </div>
          <div className="flex-1 space-y-3">
            {alerts.length > 0 ? (
              alerts.slice(0, 3).map((a) => (
                <div key={a.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-start gap-4 hover:bg-white/[0.04] transition-all cursor-default">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                    ${a.severity === 'critical' ? 'bg-red-500/10 text-red-400' : 'bg-brand-500/10 text-brand-400'}`}>
                    <TriangleAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-primary mb-1">{a.message}</p>
                    <p className="text-[10px] text-text-muted font-medium italic">{format(new Date(a.createdAt), 'MMM d, h:mm a')}</p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState icon={Bell} message="All systems nominal. No active anomalies." />
            )}
          </div>
        </div>

        {/* Row 5: Projections & Inventory (Full Width Finish) */}
        <div className="col-span-12">
          <ForecastWidget plan={user?.planTier || 'starter'} />
        </div>

        <div className="col-span-12 bento-card p-6">
           <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-3xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shadow-xl shadow-brand-500/5">
                  <Zap className="w-7 h-7 text-brand-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">Appliance Footprint Analysis</h2>
                  <p className="text-xs text-text-muted max-w-2xl mt-1">
                    You have <strong className="text-brand-400">{appliances.length}</strong> active assets in your engineering profile. 
                    Adding more devices increases the precision of your phantom load detection and savings attribution.
                  </p>
                </div>
              </div>
              <Link href="/dashboard/appliances" className="btn-primary px-8 text-xs uppercase tracking-widest font-black shrink-0">
                Manage Assets
              </Link>
           </div>
        </div>

      </motion.div>

      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />
    </motion.div>
  );
}

/* ── KPI Card ────────────────────────────────────────────────────────── */
function KpiCard({ icon: Icon, iconColor, iconBg, iconBorderColor, label, value, unit, delta, deltaLabel, badge }) {
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      className="bento-card p-4 sm:p-5 group cursor-default transition-shadow hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl ${iconBg} border ${iconBorderColor} flex items-center justify-center transition-all duration-300 group-hover:rotate-6 shadow-sm`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black text-text-faint uppercase tracking-[0.25em] mb-1 truncate">{label}</p>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <p className="text-xl sm:text-2xl font-black text-text-primary tracking-tight leading-none truncate">{value}</p>
            {unit && <span className="text-[10px] font-bold text-text-faint uppercase opacity-60">{unit}</span>}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        {delta !== null && delta !== undefined ? (
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${parseFloat(delta) > 0 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            {parseFloat(delta) > 0 ? '▲' : '▼'} {Math.abs(delta)}%
            <span className="text-text-muted/60 ml-1 font-medium lowercase tracking-normal italic">mo/mo</span>
          </div>
        ) : <div className="h-4" />}
        
        {badge && (
          <span className="text-[8px] font-black uppercase tracking-[0.15em] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md">
            {badge}
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* ── Empty State ─────────────────────────────────────────────────────── */
function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Icon className="w-5 h-5 text-text-faint" />
      </div>
      <p className="text-sm text-text-muted max-w-xs leading-relaxed">{message}</p>
    </div>
  );
}

/* ── Locked Feature Overlay (Pro Upsell) ─────────────────────────────── */
function LockedFeatureOverlay({ featureName }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface-950/20 backdrop-blur-[2px] transition-all hover:backdrop-blur-0 group-hover:bg-surface-950/40">
      <div className="bg-surface-900 border border-white/10 px-4 py-3 rounded-2xl shadow-xl flex flex-col items-center text-center transform transition-transform group-hover:scale-105">
        <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center mb-2">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
        <p className="text-xs font-bold text-white mb-0.5">{featureName}</p>
        <p className="text-[10px] text-brand-400 mb-3 uppercase tracking-widest font-black">Pro Feature</p>
        <Link href="/pricing" className="bg-brand-500 hover:bg-brand-400 text-black text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full transition-colors">
          Unlock
        </Link>
      </div>
    </div>
  );
}
