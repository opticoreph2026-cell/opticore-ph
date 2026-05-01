'use client';

import { useMemo } from 'react';
import { CalendarDays, Lock } from 'lucide-react';

/**
 * 12-month kWh usage heatmap — calendar grid style.
 * Each cell colored on an amber gradient: dim = low usage, bright = high usage.
 */
export default function UsageHeatmap({ readings = [], plan }) {
  const isPremium = plan === 'pro' || plan === 'business';

  const cells = useMemo(() => {
    // Map readings to { YYYY-MM: kWh }
    const map = {};
    readings.forEach(r => {
      if (r.readingDate) {
        const key = new Date(r.readingDate).toISOString().slice(0, 7); // "YYYY-MM"
        map[key] = (map[key] || 0) + (r.kwhUsed || 0);
      }
    });

    // Build last 12 months
    const result = [];
    const now = new Date();
    const maxKwh = Math.max(1, ...Object.values(map));

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const kwh = map[key] || 0;
      const intensity = kwh / maxKwh; // 0–1
      result.push({
        key,
        label: d.toLocaleDateString('en-PH', { month: 'short', year: '2-digit' }),
        kwh,
        intensity,
      });
    }
    return result;
  }, [readings]);

  function getHeatColor(intensity) {
    if (intensity === 0) return 'bg-surface-900 border-white/[0.04]';
    if (intensity < 0.25)  return 'bg-cyan-900/20 border-cyan-500/10';
    if (intensity < 0.5)   return 'bg-cyan-700/30 border-cyan-500/20';
    if (intensity < 0.75)  return 'bg-cyan-500/40 border-cyan-500/30';
    return 'bg-cyan-400/60 border-cyan-400/40';
  }

  function getTextColor(intensity) {
    return intensity > 0.5 ? 'text-white' : 'text-slate-500';
  }

  return (
    <div className="bento-card p-6 relative overflow-hidden">
      {/* Pro gate */}
      {!isPremium && (
        <div className="absolute inset-0 z-10 bg-surface-950/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 rounded-[inherit]">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
            <Lock className="w-5 h-5 text-slate-500" />
          </div>
          <p className="text-sm font-bold text-white">Pro Feature</p>
          <a href="/pricing" className="btn-primary text-[10px] px-6 py-2 uppercase tracking-widest">Upgrade to Pro</a>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-display font-bold text-white flex items-center gap-2 text-base">
            <CalendarDays className="w-4 h-4 text-cyan-400" /> 12-Month Usage Heatmap
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">kWh Consumption Intensity</p>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
        {cells.map(cell => (
          <div
            key={cell.key}
            title={`${cell.label}: ${cell.kwh} kWh`}
            className={`group relative aspect-square rounded-xl border flex flex-col items-center justify-center cursor-default transition-all duration-300 hover:scale-105 hover:z-20 ${getHeatColor(cell.intensity)}`}
          >
            <span className={`text-[9px] font-black leading-none uppercase ${getTextColor(cell.intensity)}`}>
              {cell.label.slice(0, 3)}
            </span>
            {cell.kwh > 0 && (
              <span className={`text-[8px] mt-0.5 font-mono font-bold ${getTextColor(cell.intensity)} opacity-70`}>
                {cell.kwh}
              </span>
            )}
            {/* Tooltip on hover */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-glass-lg">
              <span className="font-bold text-cyan-400">{cell.label}</span>: {cell.kwh > 0 ? `${cell.kwh} kWh` : 'No data'}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-6">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Low</span>
        <div className="flex gap-1.5 flex-1 h-1.5">
          {['bg-surface-900', 'bg-cyan-900/20', 'bg-cyan-700/30', 'bg-cyan-500/40', 'bg-cyan-400/60'].map((c, i) => (
            <div key={i} className={`flex-1 rounded-full ${c}`} />
          ))}
        </div>
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">High</span>
      </div>
    </div>
  );
}

