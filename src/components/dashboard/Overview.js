'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Zap, Droplets, TrendingDown, Bell, Users, Plus, 
  ArrowUpRight, ArrowDownRight, MoreHorizontal,
  ChevronRight, Activity, Calendar
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import SubmitReadingModal from '@/components/dashboard/SubmitReadingModal';
import GridStatusBanner from '@/components/dashboard/GridStatusBanner';
import Toast from '@/components/ui/Toast';

const PIE_COLORS = ['#22d3ee', '#a855f7', '#6366f1', '#f59e0b'];

export default function DashboardOverview({ user, readings = [], alerts = [], appliances = [] }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('info');

  const latest = readings[0] || {};
  const previous = readings[1] || {};
  
  const kwhDelta = latest.kwhUsed
    ? ((latest.kwhUsed - (previous.kwhUsed ?? latest.kwhUsed)) / (previous.kwhUsed || 1) * 100).toFixed(1)
    : '0.0';

  const totalBill = (latest.billAmountElectric ?? 0) + (latest.billAmountWater ?? 0);
  const billDelta = totalBill && (previous.billAmountElectric + previous.billAmountWater)
    ? ((totalBill - (previous.billAmountElectric + previous.billAmountWater)) / (previous.billAmountElectric + previous.billAmountWater) * 100).toFixed(1)
    : '0.0';

  // Chart Data Preparation
  const chartData = useMemo(() => {
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
    { id: 1, type: 'Bill Logged', user: 'Admin', date: '2 mins ago', status: 'Success' },
    { id: 2, type: 'Appliance Linked', user: 'Admin', date: '1 hour ago', status: 'Success' },
    { id: 3, type: 'Alert Resolved', user: 'System', date: '4 hours ago', status: 'Auto' },
    { id: 4, type: 'Report Generated', user: 'Admin', date: '1 day ago', status: 'Success' },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-[1600px] mx-auto animate-in">
      
      <GridStatusBanner />

      {/* ── Row 1: KPI Stats ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KpiCard 
          label="Active Assets"
          value={appliances.length.toLocaleString()}
          delta="+12%"
          isPositive={true}
          icon={Users}
          color="cyan"
          sparklineData={chartData.slice(-6)}
        />
        <KpiCard 
          label="Active Utilities"
          value="14,562"
          delta="98% Uptime"
          isPositive={true}
          icon={Zap}
          color="purple"
          sparklineData={chartData.slice(-6)}
        />
        <KpiCard 
          label="Current Bill"
          value={`₱${totalBill.toLocaleString()}`}
          delta={`${billDelta}%`}
          isPositive={parseFloat(billDelta) < 0}
          icon={TrendingDown}
          color="amber"
          sparklineData={chartData.slice(-6)}
        />
        <KpiCard 
          label="Active Alerts"
          value={alerts.length.toString()}
          delta="12 High"
          isPositive={false}
          icon={Bell}
          color="rose"
          sparklineData={chartData.slice(-6)}
        />
      </div>

      {/* ── Row 2: Main Visualization ───────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Main Consumption Chart */}
        <div className="col-span-12 xl:col-span-8 bento-card p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-display text-xl font-bold text-white">Real-Time Utility Analysis</h3>
              <p className="text-sm text-slate-500 mt-1">Energy consumption patterns across your entire asset footprint</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-[11px] font-bold text-slate-400">
                <Calendar className="w-3 h-3" />
                Last 12 Months
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a0a0f', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#22d3ee" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Consumption Donut */}
        <div className="col-span-12 xl:col-span-4 bento-card p-8 flex flex-col">
          <h3 className="text-display text-xl font-bold text-white mb-2">Consumption Breakdown</h3>
          <p className="text-sm text-slate-500 mb-8">Asset-level attribution summary</p>
          
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdownData}
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {breakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Center Label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-2xl font-black text-white">82%</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Efficiency</p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {breakdownData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                  <span className="text-sm font-medium text-slate-300">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: History & Recent ─────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* History Bar Chart */}
        <div className="col-span-12 lg:col-span-4 bento-card p-8">
          <h3 className="text-display text-xl font-bold text-white mb-8">Consumption History</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.slice(-6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 11}}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="value" fill="#22d3ee" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <button className="w-full mt-6 py-3 rounded-2xl bg-white/[0.03] border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-400 hover:border-cyan-400/20 transition-all">
            Download Detailed Report
          </button>
        </div>

        {/* Recent Activity Table */}
        <div className="col-span-12 lg:col-span-8 bento-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-display text-xl font-bold text-white">Recent Activity</h3>
            <button className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Activity Type</th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">User Role</th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Timestamp</th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                  <th className="pb-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentActivity.map((act) => (
                  <tr key={act.id} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-cyan-400">
                          <Activity className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-white">{act.type}</span>
                      </div>
                    </td>
                    <td className="py-5 text-sm text-slate-400 font-medium">{act.user}</td>
                    <td className="py-5 text-sm text-slate-500 font-mono">{act.date}</td>
                    <td className="py-5">
                      <span className={clsx(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        act.status === 'Success' ? "bg-emerald-500/10 text-emerald-400" : "bg-cyan-500/10 text-cyan-400"
                      )}>
                        {act.status}
                      </span>
                    </td>
                    <td className="py-5 text-right">
                      <button className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/5 text-slate-500">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Intelligence Upsell Card ────────────────────────────────── */}
      <div className="bento-card p-10 bg-gradient-to-br from-cyan-600/[0.08] to-purple-600/[0.08] border-cyan-500/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3 group-hover:bg-cyan-500/20 transition-all duration-700" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-6 shadow-2xl shadow-cyan-500/20">
              <Zap className="w-8 h-8 text-cyan-400" />
            </div>
            <h2 className="text-display text-3xl font-black text-white mb-4">Unlock Predictive Intelligence</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Match your appliance models with our engineering database for <strong className="text-cyan-400">99.8% precision</strong>. 
              Predict failures before they happen and automate your energy savings.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <Link href="/dashboard/appliances" className="btn-primary min-w-[200px]">
              Profile Appliances
            </Link>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 rounded-2xl bg-white/[0.05] border border-white/10 text-white font-bold text-sm hover:bg-white/[0.08] transition-all"
            >
              Log Bill Data
            </button>
          </div>
        </div>
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
    </div>
  );
}

/* ── KpiCard Component ─────────────────────────────────────────────────── */
function KpiCard({ label, value, delta, isPositive, icon: Icon, color, sparklineData }) {
  const colorMap = {
    cyan:   'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 shadow-cyan-500/10',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-purple-500/10',
    amber:  'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-amber-500/10',
    rose:   'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-rose-500/10',
  };

  const strokeMap = {
    cyan:   '#22d3ee',
    purple: '#a855f7',
    amber:  '#f59e0b',
    rose:   '#f43f5e',
  };

  return (
    <div className="bento-card p-6 flex flex-col group hover:scale-[1.02] transition-all">
      <div className="flex items-start justify-between mb-6">
        <div className={clsx("w-12 h-12 rounded-2xl border flex items-center justify-center transition-transform group-hover:rotate-6 shadow-lg", colorMap[color])}>
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
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</p>
          <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
        </div>
        
        {/* Minimal Sparkline */}
        <div className="w-24 h-12 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={strokeMap[color]} 
                strokeWidth={2} 
                fill="none" 
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
