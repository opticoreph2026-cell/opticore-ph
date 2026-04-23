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
          <p className="section-label mb-1">Command Center</p>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Good day, <span className="shimmer-text">{user?.name?.split(' ')[0] ?? 'Guest'}</span> 👋
          </h1>
          <p className="text-xs text-text-muted mt-1 font-medium">
            Utility usage overview — {new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary inline-flex items-center gap-2 text-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Submit Monthly Reading
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
          icon={Droplets} iconColor="text-blue-400" iconBg="bg-blue-500/15" iconBorderColor="border-blue-500/25"
          label="Water Usage" value={latest.m3Used ?? '—'} unit="m³"
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
      <motion.div variants={itemVariants} className="grid grid-cols-12 gap-3.5">

        {/* Usage Chart — 8 cols */}
        <div className="col-span-12 lg:col-span-8 bento-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="section-label mb-0.5">History</p>
              <h2 className="font-bold text-text-primary text-base">Usage Trends</h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-faint bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06]">
              Last 6 months
            </span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="kwhGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="m3Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.035)" />
                <XAxis dataKey="month" tick={{ fill: '#4a4858', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4a4858', fontSize: 10 }} axisLine={false} tickLine={false} width={32} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(14,14,20,0.95)',
                    border: '1px solid rgba(245,158,11,0.2)',
                    borderRadius: 12, fontSize: 12, color: '#f1f0ef',
                    backdropFilter: 'blur(12px)',
                  }}
                />
                <Area type="monotone" dataKey="kWh" stroke="#f59e0b" strokeWidth={2.5} fill="url(#kwhGrad)" name="kWh" dot={false} />
                <Area type="monotone" dataKey="m3"  stroke="#60a5fa" strokeWidth={2.5} fill="url(#m3Grad)"  name="m³" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={FileText} message="No readings yet. Submit your first month to see trends." />
          )}
        </div>

        {/* Daily Tracker — 4 cols */}
        <div className="col-span-12 lg:col-span-4">
          <DailyTracker />
        </div>

        {/* Heatmap — full width */}
        <div className="col-span-12">
          <UsageHeatmap readings={readings} plan={user?.planTier || 'starter'} />
        </div>

        {/* Ghost Load + Asset Matchmaker — 6+6 */}
        <div className="col-span-12 lg:col-span-6">
          <GhostLoadChart plan={user?.planTier || 'starter'} />
        </div>

        <div className="col-span-12 lg:col-span-6 bento-card p-5 group h-full !overflow-visible z-10 focus-within:z-50">
          <div className="flex flex-col gap-4 h-full">
            <div>
              <p className="section-label mb-0.5">Asset Matchmaker</p>
              <h2 className="font-bold text-text-primary group-hover:text-brand-300 transition-colors flex items-center gap-2">
                <Cpu className="w-4 h-4 text-brand-400" />
                Engineering Database Search
              </h2>
              <p className="text-[11px] text-text-muted leading-relaxed mt-1 max-w-sm">
                Import manufacturer-grade wattage and EER profiles directly into your appliance footprint.
              </p>
            </div>
            <div className="relative flex-1 rounded-xl border border-white/[0.05] bg-surface-900/40" style={{ minHeight: '60px' }}>
              <CatalogSearch onSelect={handleLinkAppliance} />
              {isLinking && (
               <div className="absolute inset-0 bg-surface-950/80 backdrop-blur-sm flex items-center justify-center z-[60] rounded-xl">
                  <span className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em] animate-pulse">
                    Linking Profile…
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* AI Intelligence + Alerts (Text Heavy row) — 6+6 */}
        <div className="col-span-12 lg:col-span-6 bento-card p-5 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="section-label mb-0.5">AI Engine</p>
              <h2 className="font-bold text-text-primary flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-400" />
                Intelligence Analysis
              </h2>
            </div>
            {readings.length > 0 && (
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="text-[9px] uppercase tracking-[0.18em] font-black text-brand-400 hover:text-brand-300 disabled:opacity-40 transition-colors bg-brand-500/10 hover:bg-brand-500/15 border border-brand-500/20 px-2.5 py-1.5 rounded-lg shrink-0"
              >
                {isGenerating ? '⚡ Analyzing…' : '↻ Refresh'}
              </button>
            )}
          </div>

          {alerts.some(a => a.severity === 'critical') && (
            <div className="mb-4 p-3 rounded-xl text-[11px] text-red-300 flex items-center gap-2 font-semibold"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}
            >
              <TriangleAlert className="w-3.5 h-3.5 shrink-0" /> Critical leakage pattern detected this month.
            </div>
          )}

          <div className="flex-1 flex flex-col justify-center">
            {readings.length > 0 ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl italic text-sm text-text-secondary leading-relaxed relative"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span className="absolute -top-1 left-2 text-4xl text-brand-500/15 font-serif leading-none select-none">"</span>
                  {activeReport?.summary || 'No active analysis. Click "Refresh Scan" to run the Attribution Engine.'}
                </div>
                {reportData && (
                  <div className="flex flex-wrap gap-2">
                    {reportData.electric && (
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border flex items-center gap-1.5
                        ${reportData.electric.severity === 'CRITICAL' ? 'bg-red-500/10 border-red-500/25 text-red-400' :
                          reportData.electric.severity === 'LEAKING' ? 'bg-orange-500/10 border-orange-500/25 text-orange-400' :
                          'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                        <Zap className="w-2.5 h-2.5" /> Power: {reportData.electric.discrepancy.percentage}% Delta
                      </span>
                    )}
                    {reportData.water && (
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border flex items-center gap-1.5
                        ${reportData.water.severity === 'CRITICAL' ? 'bg-red-500/10 border-red-500/25 text-red-400' :
                          reportData.water.severity === 'LEAKING' ? 'bg-orange-500/10 border-orange-500/25 text-orange-400' :
                          'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                        <Droplets className="w-2.5 h-2.5" /> Water: {reportData.water.discrepancy.percentage}% Delta
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <EmptyState icon={FileText} message="Submit your first reading to unlock AI-driven attribution analysis." />
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 bento-card p-5 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="section-label mb-0.5">Notifications</p>
              <h2 className="font-bold text-text-primary flex items-center gap-2">
                <Bell className="w-4 h-4 text-orange-400" />
                Recent Alerts
              </h2>
            </div>
            <Link href="/dashboard/alerts"
              className="text-[9px] uppercase tracking-[0.18em] font-black text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/15 border border-brand-500/20 px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
            >
              View All
            </Link>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {alerts.length > 0 ? (
              <ul className="space-y-2">
                {alerts.slice(0, 4).map((a) => (
                  <li key={a.id} className="flex items-start gap-3 p-3 rounded-xl transition-colors"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5
                      ${a.severity === 'critical' ? 'bg-red-500/15 border border-red-500/25' :
                        a.severity === 'warning'  ? 'bg-orange-500/15 border border-orange-500/25' :
                        'bg-brand-500/15 border border-brand-500/25'}`}
                    >
                      <TriangleAlert className={`w-3.5 h-3.5
                        ${a.severity === 'critical' ? 'text-red-400' :
                          a.severity === 'warning'  ? 'text-orange-400' : 'text-brand-400'}`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-text-secondary leading-snug">{a.message ?? 'Alert'}</p>
                      <p className="text-[9px] text-text-faint mt-0.5">
                        {a.createdAt ? format(new Date(a.createdAt), 'MMM d, h:mm a') : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={Bell} message="No active alerts. Your usage looks healthy!" />
            )}
          </div>
        </div>

        {/* ── Gated Pro Features: Water & LPG Tracking (6+6 row) ── */}
        <div className="col-span-12 lg:col-span-6 bento-card p-5 relative overflow-hidden flex flex-col justify-center border-blue-500/20"
          style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(10,10,15,0.8) 100%)', minHeight: '180px' }}
        >
          {user?.planTier === 'starter' && <LockedFeatureOverlay featureName="Water Leak Detector" />}
          <div className={user?.planTier === 'starter' ? 'blur-md opacity-40 select-none flex-1 flex flex-col justify-center' : 'flex-1 flex flex-col justify-center'}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Droplets className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Water Leak Guard</h3>
                <p className="text-[10px] text-blue-200/70 leading-snug max-w-[220px] mt-1">
                  How it works: Simply log your standard monthly water bill. AI automatically analyzes the jump to spot hidden leaks.
                </p>
              </div>
            </div>
            <div className="p-3 bg-blue-950/20 rounded-xl border border-blue-500/10 mt-2">
              <p className="text-sm font-medium text-blue-100/80 mb-2">Current Status</p>
              <div className="text-2xl font-black text-white flex items-baseline gap-2">
                {waterAnalysis ? (
                  waterAnalysis.hasLeak ? (
                    <>Leak Detected <span className="text-xs text-red-400 font-bold uppercase tracking-wider">+{waterAnalysis.jump}% Dev</span></>
                  ) : (
                    <>Healthy <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">{waterAnalysis.jump}% Dev</span></>
                  )
                ) : (
                  <>Calibrating... <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">Need more data</span></>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 bento-card p-5 relative overflow-hidden flex flex-col justify-center border-red-500/20"
           style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.05) 0%, rgba(10,10,15,0.8) 100%)', minHeight: '180px' }}
        >
          {user?.planTier === 'starter' && <LockedFeatureOverlay featureName="LPG Depletion Predictor" />}
          <div className={user?.planTier === 'starter' ? 'blur-md opacity-40 select-none flex-1 flex flex-col justify-center' : 'flex-1 flex flex-col justify-center'}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">LPG Tank Predictor</h3>
                  <p className="text-xs text-red-200/50">Smart burn-rate chronometer</p>
                </div>
              </div>
              <button
                onClick={() => setIsLpgModalOpen(true)}
                className="text-[9px] uppercase tracking-[0.18em] font-black text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
              >
                Log New Tank
              </button>
            </div>
            
            {lpgStatus ? (
              lpgStatus.status === 'insufficient_data' ? (
                <div className="p-3 bg-red-950/20 rounded-xl border border-red-500/10 mt-2 text-xs text-red-200">
                  {lpgStatus.message}
                </div>
              ) : lpgStatus.status === 'empty' ? (
                <div className="p-3 bg-red-950/20 rounded-xl border border-red-500/10 mt-2 text-sm text-red-400 font-bold">
                  Tank is fully depleted. Log a replacement.
                </div>
              ) : (
                <div className="p-3 bg-red-950/20 rounded-xl border border-red-500/10 mt-2">
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-red-200/60">Estimated Empty Date</p>
                    <p className={`text-xs font-bold ${lpgStatus.status === 'critical' ? 'text-red-500' : lpgStatus.status === 'warning' ? 'text-orange-400' : 'text-emerald-400'}`}>
                      {lpgStatus.status === 'critical' ? 'CRITICAL (0 Days)' : `${lpgStatus.daysLeft} Days Left`}
                    </p>
                  </div>
                  <div className="w-full bg-surface-900 rounded-full h-2.5 outline outline-1 outline-white/5">
                    <div className={`h-2.5 rounded-full transition-all duration-1000 ${
                      lpgStatus.status === 'critical' ? 'bg-red-600' : 
                      lpgStatus.status === 'warning' ? 'bg-gradient-to-r from-orange-400 to-red-500' : 
                      'bg-gradient-to-r from-emerald-400 to-orange-400'
                    }`} style={{ width: `${lpgStatus.percentLeft}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center mt-2.5 opacity-60">
                     <p className="text-[9px] uppercase tracking-wider font-bold text-red-200/50">Current: {lpgStatus.currentTank.tankSizeKg}kg Tank</p>
                     <p className="text-[9px] uppercase tracking-wider font-bold text-red-200/50">Projected: {lpgStatus.estimatedDate}</p>
                  </div>
                </div>
              )
            ) : (
              <div className="p-3 bg-red-950/20 rounded-xl border border-red-500/10 mt-2 text-xs text-red-200/50">
                 System Uncalibrated. 
              </div>
            )}
          </div>
        </div>

        {/* Forecast — Full Layout */}
        <div className="col-span-12">
          <ForecastWidget plan={user?.planTier || 'starter'} />
        </div>

        {/* Appliance summary */}
        {appliances.length === 0 ? (
          <div className="col-span-12 bento-card p-5 border-brand-500/15"
            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(10,10,15,0.6) 100%)' }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)' }}
                >
                  <Cpu className="w-6 h-6 text-brand-400" />
                </div>
                <div>
                  <h3 className="text-text-primary font-bold">Build your appliance profile</h3>
                  <p className="text-sm text-text-muted">Add your appliances to unlock AI-powered savings tips and phantom load detection.</p>
                </div>
              </div>
              <Link href="/dashboard/appliances" className="btn-primary shrink-0 text-sm">
                Add Appliances
              </Link>
            </div>
          </div>
        ) : (
          <div className="col-span-12 bento-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-brand-400" />
                </div>
                <div>
                  <h2 className="font-bold text-text-primary">Appliance Footprint</h2>
                  <p className="text-xs text-text-muted">
                    <strong className="text-text-primary">{appliances.length}</strong> {appliances.length === 1 ? 'appliance' : 'appliances'} profiled — AI uses this data for cross-referenced anomaly detection.
                  </p>
                </div>
              </div>
              <Link href="/dashboard/appliances" className="text-[9px] uppercase tracking-[0.18em] font-black text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/15 border border-brand-500/20 px-2.5 py-1.5 rounded-lg transition-colors">
                Manage
              </Link>
            </div>
          </div>
        )}
      </motion.div>

      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />
    </motion.div>
  );
}

/* ── KPI Card ────────────────────────────────────────────────────────── */
function KpiCard({ icon: Icon, iconColor, iconBg, iconBorderColor, label, value, unit, delta, deltaLabel, badge }) {
  return (
    <div className="bento-card p-5 group cursor-default">
      {/* Top row: icon + badge */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl ${iconBg} border ${iconBorderColor} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        {badge && (
          <span className="text-[8px] font-black uppercase tracking-[0.15em] text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-md">
            {badge}
          </span>
        )}
      </div>

      <p className="text-[9px] font-black text-text-faint uppercase tracking-[0.2em] mb-1">{label}</p>
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <p className="text-2xl md:text-3xl font-black text-text-primary tracking-tight leading-none truncate max-w-full">{value}</p>
        {unit && <span className="text-[10px] font-bold text-text-faint uppercase">{unit}</span>}
      </div>


      {delta !== null && delta !== undefined && (
        <p className={`text-[10px] mt-2 font-bold flex items-center gap-1 ${parseFloat(delta) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
          {parseFloat(delta) > 0 ? '▲' : '▼'}
          {Math.abs(delta)}% <span className="text-text-faint font-medium">{deltaLabel}</span>
        </p>
      )}
    </div>
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
