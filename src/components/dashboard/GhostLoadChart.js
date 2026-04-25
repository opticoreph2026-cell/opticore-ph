'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';
import { Zap, AlertTriangle, ShieldCheck, Lock, Sparkles } from 'lucide-react';

const SEVERITY_CONFIG = {
  NORMAL:   { label: 'Healthy Grid',  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', pulse: false },
  LEAKING:  { label: 'Energy Leak',  color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20',  pulse: false },
  CRITICAL: { label: 'High Waste', color: 'text-rose-400',     bg: 'bg-rose-500/10 border-rose-500/20',        pulse: true  },
};

const CATEGORY_COLORS = {
  AC:           '#22d3ee', // Cyan
  Fridge:       '#3b82f6', // Blue
  Heater:       '#f59e0b', // Amber
  Pump:         '#10b981', // Emerald
  'Ghost Load': '#f43f5e', // Rose
  Other:        '#64748b', // Slate
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-surface-900/95 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-2xl min-w-[160px]">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{item.name}</p>
      <div className="flex items-end gap-2">
        <p className="text-xl font-black text-white leading-none">{item.value.toFixed(1)}</p>
        <p className="text-xs font-bold text-slate-500 pb-0.5">kWh</p>
      </div>
      <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Share</span>
        <span className="text-xs font-black text-cyan-400">{item.payload.pct}%</span>
      </div>
    </div>
  );
};

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="drop-shadow-[0_0_12px_rgba(34,211,238,0.3)]"
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 12}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export default function GhostLoadChart({ plan }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const isPremium = plan === 'pro' || plan === 'business' || plan === 'PRO' || plan === 'BUSINESS';

  useEffect(() => {
    fetch('/api/dashboard/attribution')
      .then(r => r.json())
      .then(d => setData(d.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card h-[420px] flex items-center justify-center border-white/[0.03]">
        <div className="w-10 h-10 rounded-full border-4 border-cyan-500/10 border-t-cyan-500 animate-spin" />
      </div>
    );
  }

  if (!data?.electric) {
    return (
      <div className="card h-[420px] flex flex-col items-center justify-center text-center p-8 border-dashed border-white/10">
        <div className="w-16 h-16 rounded-[24px] bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 shadow-2xl">
          <Zap className="w-8 h-8 text-slate-600" />
        </div>
        <h3 className="text-lg font-black text-white tracking-tight mb-2">No Usage Data Found</h3>
        <p className="text-sm text-slate-500 max-w-[260px] leading-relaxed">
          Start by adding your appliances to the <span className="text-cyan-400 font-bold">Asset Inventory</span> to see your energy distribution.
        </p>
      </div>
    );
  }

  const electric = data.electric;
  const severity = electric.severity;
  const cfg      = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.NORMAL;
  const SeverityIcon = severity === 'NORMAL' ? ShieldCheck : AlertTriangle;

  const pieData = Object.entries(electric.categories).map(([name, cat]) => ({
    name,
    value: cat.value,
    pct: cat.percentageOfTotal,
  }));
  if (electric.discrepancy.value > 0) {
    pieData.push({
      name: 'Ghost Load',
      value: electric.discrepancy.value,
      pct: electric.discrepancy.percentage,
    });
  }

  return (
    <div className="card p-8 h-full flex flex-col relative overflow-hidden bg-surface-1000/20 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-black text-white tracking-tighter flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            Appliance Attribution
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium italic">Ghost-load detection active</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.color}`}>
          {cfg.pulse && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" />}
          <SeverityIcon className="w-3.5 h-3.5" />
          {cfg.label}
        </div>
      </div>

      {/* Lock overlay for Starter — blurs content */}
      {!isPremium && (
        <div className="absolute inset-0 z-30 bg-surface-1000/80 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center rounded-[32px]">
          <div className="w-16 h-16 rounded-[24px] bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 shadow-2xl ring-1 ring-white/5">
            <Lock className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-xl font-black text-white tracking-tight mb-3">Enterprise Feature</h3>
          <p className="text-sm text-slate-500 max-w-[280px] leading-relaxed mb-8">
            Upgrade to <span className="text-cyan-400 font-bold uppercase tracking-widest">PRO</span> to unlock detailed appliance attribution and identify hidden "Ghost Loads" in your home.
          </p>
          <a href="/pricing" className="px-8 py-4 rounded-2xl bg-cyan-500 text-surface-1000 font-black text-sm uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_8px_32px_rgba(34,211,238,0.3)]">
            Upgrade Now
          </a>
        </div>
      )}

      {/* Chart */}
      <div className="flex-1 min-h-[220px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              animationBegin={0}
              animationDuration={1500}
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={entry.name} 
                  fill={CATEGORY_COLORS[entry.name] || '#475569'} 
                  stroke="transparent"
                  className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Label */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</p>
          <p className="text-2xl font-black text-white">{pieData.reduce((acc, curr) => acc + curr.value, 0).toFixed(0)}</p>
          <p className="text-[10px] font-bold text-slate-600 uppercase">kWh</p>
        </div>
      </div>

      {/* Legend - Professional Grid */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-6">
        {pieData.map(entry => (
          <div key={entry.name} className="flex items-center justify-between group cursor-help">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: CATEGORY_COLORS[entry.name] || '#475569' }} />
              <span className="text-[11px] font-bold text-slate-400 group-hover:text-white transition-colors">{entry.name}</span>
            </div>
            <span className="text-[11px] font-black text-white font-mono tracking-tighter">{entry.pct}%</span>
          </div>
        ))}
      </div>

      {/* Callout */}
      {electric.discrepancy.value > 0 && (
        <div className={`mt-8 p-4 rounded-2xl border flex items-start gap-4 transition-all duration-500 ${
          severity === 'CRITICAL' ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' :
          severity === 'LEAKING'  ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' :
          'bg-white/[0.02] border-white/5 text-slate-400'
        }`}>
          <div className="mt-1">
            <Sparkles className={`w-4 h-4 ${severity === 'CRITICAL' ? 'text-rose-400' : 'text-cyan-400'}`} />
          </div>
          <p className="text-[11px] leading-relaxed font-medium">
            <strong className="uppercase tracking-widest mr-1">Analysis:</strong>
            {electric.discrepancy.value.toFixed(1)} kWh ({electric.discrepancy.percentage}%) unaccounted for. 
            {severity !== 'NORMAL' ? ' We recommend a physical audit of your legacy appliances.' : ' Your household energy profile is highly efficient.'}
          </p>
        </div>
      )}
    </div>
  );
}
