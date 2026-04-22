'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Zap, AlertTriangle, ShieldCheck, Lock } from 'lucide-react';

const SEVERITY_CONFIG = {
  NORMAL:   { label: 'Healthy',  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25', pulse: false },
  LEAKING:  { label: 'Leaking',  color: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/25',  pulse: false },
  CRITICAL: { label: 'Critical', color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/25',        pulse: true  },
};

const CATEGORY_COLORS = {
  AC:           '#f59e0b',
  Fridge:       '#60a5fa',
  Heater:       '#f97316',
  Pump:         '#34d399',
  'Ghost Load': '#ef4444',
  Other:        '#8b5cf6',
};

function getColor(name) {
  return CATEGORY_COLORS[name] || '#6b7280';
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-surface-800 border border-white/10 rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="font-bold text-text-primary mb-0.5">{item.name}</p>
      <p className="text-text-muted">{item.value.toFixed(1)} kWh</p>
      <p className="text-text-muted">{item.payload.pct}% of total</p>
    </div>
  );
};

export default function GhostLoadChart({ plan }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  const isPremium = plan === 'pro' || plan === 'business';

  useEffect(() => {
    fetch('/api/dashboard/attribution')
      .then(r => r.json())
      .then(d => setData(d.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card h-full flex items-center justify-center py-10">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
      </div>
    );
  }

  if (!data?.electric) {
    return (
      <div className="card h-full flex flex-col items-center justify-center text-center py-10 gap-3">
        <div className="w-12 h-12 rounded-2xl bg-surface-700 flex items-center justify-center">
          <Zap className="w-6 h-6 text-text-muted" />
        </div>
        <p className="text-sm font-medium text-text-primary">No attribution data</p>
        <p className="text-[11px] text-text-muted max-w-[200px]">
          Profile your appliances and submit a reading to enable ghost-load detection.
        </p>
      </div>
    );
  }

  const electric = data.electric;
  const severity = electric.severity;
  const cfg      = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.NORMAL;
  const SeverityIcon = severity === 'NORMAL' ? ShieldCheck : AlertTriangle;

  // Build pie data from categories + ghost load segment
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
    <div className="card h-full flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-text-primary text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-400" /> Appliance Attribution
          </h2>
          <p className="text-[11px] text-text-muted mt-0.5">Ghost-load detection · {data.readingDate}</p>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${cfg.bg} ${cfg.color}`}>
          {cfg.pulse && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
          <SeverityIcon className="w-3 h-3" />
          {cfg.label}
        </div>
      </div>

      {/* Lock overlay for Starter — blurs content */}
      {!isPremium && (
        <div className="absolute inset-0 z-10 bg-surface-900/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 rounded-2xl">
          <div className="w-11 h-11 rounded-xl bg-surface-700 border border-white/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-text-muted" />
          </div>
          <p className="text-sm font-semibold text-text-primary">Pro Feature</p>
          <p className="text-[11px] text-text-muted text-center max-w-[180px]">
            Upgrade to unlock appliance attribution & ghost-load detection.
          </p>
          <a href="/pricing" className="btn-primary text-xs px-4 py-2 mt-1">Upgrade to Pro</a>
        </div>
      )}

      {/* Chart */}
      <div className="flex-1 min-h-[180px]">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={2}
              dataKey="value"
            >
              {pieData.map((entry) => (
                <Cell key={entry.name} fill={getColor(entry.name)} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
        {pieData.map(entry => (
          <div key={entry.name} className="flex items-center gap-1.5 text-[10px]">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getColor(entry.name) }} />
            <span className="text-text-muted truncate">{entry.name}</span>
            <span className="ml-auto font-mono font-bold text-text-secondary">{entry.pct}%</span>
          </div>
        ))}
      </div>

      {/* Ghost load callout */}
      {electric.discrepancy.value > 0 && (
        <div className={`mt-4 p-3 rounded-xl border text-[11px] leading-relaxed ${
          severity === 'CRITICAL' ? 'bg-red-500/10 border-red-500/20 text-red-300' :
          severity === 'LEAKING'  ? 'bg-orange-500/10 border-orange-500/20 text-orange-300' :
          'bg-surface-700/50 border-white/5 text-text-muted'
        }`}>
          <strong>Ghost Load:</strong> {electric.discrepancy.value} kWh ({electric.discrepancy.percentage}%) unaccounted for by profiled appliances.
          {severity !== 'NORMAL' && ' Consider an energy audit.'}
        </div>
      )}
    </div>
  );
}
