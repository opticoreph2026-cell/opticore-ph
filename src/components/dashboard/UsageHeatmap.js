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
        const key = r.readingDate.slice(0, 7); // "YYYY-MM"
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
    if (intensity === 0) return 'bg-surface-700/60 border-white/[0.04]';
    if (intensity < 0.25)  return 'bg-amber-900/40 border-amber-800/30';
    if (intensity < 0.5)   return 'bg-amber-700/50 border-amber-600/30';
    if (intensity < 0.75)  return 'bg-amber-500/60 border-amber-400/30';
    return 'bg-amber-400/80 border-amber-300/40';
  }

  function getTextColor(intensity) {
    return intensity > 0.5 ? 'text-surface-900' : 'text-text-muted';
  }

  return (
    <div className="card relative overflow-hidden">
      {/* Pro gate */}
      {!isPremium && (
        <div className="absolute inset-0 z-10 bg-surface-900/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 rounded-2xl">
          <Lock className="w-5 h-5 text-text-muted" />
          <p className="text-sm font-semibold text-text-primary">Pro Feature</p>
          <a href="/pricing" className="btn-primary text-xs px-4 py-2">Upgrade to Pro</a>
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-text-primary flex items-center gap-2 text-sm">
          <CalendarDays className="w-4 h-4 text-brand-400" /> 12-Month Usage Heatmap
        </h2>
        <span className="text-[10px] text-text-muted uppercase tracking-widest font-semibold">kWh Intensity</span>
      </div>

      {/* Heatmap grid */}
      <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
        {cells.map(cell => (
          <div
            key={cell.key}
            title={`${cell.label}: ${cell.kwh} kWh`}
            className={`group relative aspect-square rounded-lg border flex flex-col items-center justify-center cursor-default transition-transform hover:scale-105 ${getHeatColor(cell.intensity)}`}
          >
            <span className={`text-[9px] font-bold leading-none ${getTextColor(cell.intensity)}`}>
              {cell.label.slice(0, 3)}
            </span>
            {cell.kwh > 0 && (
              <span className={`text-[8px] mt-0.5 font-mono ${getTextColor(cell.intensity)} opacity-70`}>
                {cell.kwh}
              </span>
            )}
            {/* Tooltip on hover */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface-800 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
              {cell.label}: {cell.kwh > 0 ? `${cell.kwh} kWh` : 'No data'}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4">
        <span className="text-[10px] text-text-muted">Low</span>
        <div className="flex gap-1 flex-1">
          {['bg-surface-700/60', 'bg-amber-900/40', 'bg-amber-700/50', 'bg-amber-500/60', 'bg-amber-400/80'].map((c, i) => (
            <div key={i} className={`h-2 flex-1 rounded ${c}`} />
          ))}
        </div>
        <span className="text-[10px] text-text-muted">High</span>
      </div>
    </div>
  );
}
