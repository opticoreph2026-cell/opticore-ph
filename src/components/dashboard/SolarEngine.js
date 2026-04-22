'use client';

import { useState } from 'react';
import { Sun, Calculator, Zap, ArrowRight, Settings2, BarChart4 } from 'lucide-react';

export default function SolarEngine({ initialAvgKwh = 0, effectiveRate = 12.5 }) {
  const [kwh, setKwh] = useState(initialAvgKwh > 0 ? initialAvgKwh : 450);
  const [rate, setRate] = useState(effectiveRate);
  const [hasNetMetering, setHasNetMetering] = useState(true);
  
  // Philippine Solar Constants
  const PEAK_SUN_HOURS = 4.5;
  const PANEL_WATTAGE = 550; // 550W Tier-1 Panels
  const COST_PER_KW = 70000; // ₱70,000 per kW installed (Grid-tied)

  // Calculations
  const dailyKwh = kwh / 30;
  
  // If net metering, size the system to offset 100% of bill over the month
  // If no net metering, size to offset ~40% (daylight usage only)
  const offsetMultiplier = hasNetMetering ? 1 : 0.4;
  
  const targetDailyProduction = dailyKwh * offsetMultiplier;
  const requiredSystemKw = targetDailyProduction / PEAK_SUN_HOURS;
  
  // Round to nearest 0.5 kW
  const systemSizeKw = Math.max(1, Math.ceil(requiredSystemKw * 2) / 2);
  
  const panelCount = Math.ceil((systemSizeKw * 1000) / PANEL_WATTAGE);
  const estimatedCost = systemSizeKw * COST_PER_KW;
  
  // Monthly savings in PHP
  const monthlySavings = (systemSizeKw * PEAK_SUN_HOURS * 30) * rate;
  const actualSavings = Math.min(monthlySavings, kwh * rate * offsetMultiplier); // Cap savings at current bill
  
  const paybackMonths = estimatedCost / actualSavings;
  const paybackYears = (paybackMonths / 12).toFixed(1);
  const tenYearROI = (actualSavings * 120) - estimatedCost;

  return (
    <div className="grid lg:grid-cols-12 gap-6 items-start">
      {/* ── Input Panel ── */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bento-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings2 className="w-5 h-5 text-brand-400" />
            <h2 className="font-bold text-white text-lg">System Variables</h2>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">
                Monthly Average (kWh)
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  value={kwh} 
                  onChange={(e) => setKwh(Number(e.target.value))}
                  className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-brand-500/50"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-text-faint font-medium">kWh</span>
              </div>
              {initialAvgKwh > 0 && (
                 <p className="text-[10px] text-brand-400 mt-1.5 flex items-center gap-1">
                   <Zap className="w-3 h-3" /> Auto-synced from your profile
                 </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">
                Effective Utility Rate
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-faint font-medium">₱</span>
                <input 
                  type="number" 
                  step="0.1"
                  value={rate} 
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full bg-surface-900 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white font-bold focus:outline-none focus:border-brand-500/50"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-text-faint font-medium">/ kWh</span>
              </div>
            </div>

            <div className="p-4 bg-surface-900 border border-white/10 rounded-xl">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-bold text-white mb-0.5">Meralco Net Metering</p>
                  <p className="text-[10px] text-text-muted">Export excess power back to the grid</p>
                </div>
                <div className="relative inline-flex items-center">
                  <input type="checkbox" className="sr-only peer" checked={hasNetMetering} onChange={() => setHasNetMetering(!hasNetMetering)} />
                  <div className="w-9 h-5 bg-surface-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-brand-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ── Results Panel ── */}
      <div className="lg:col-span-8 space-y-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bento-card p-5 border-t-2 border-t-blue-500">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-faint mb-1">Required System</p>
            <p className="text-3xl font-black text-white">{systemSizeKw}<span className="text-sm text-text-muted ml-1">kWp</span></p>
            <p className="text-xs text-text-secondary mt-2 border-t border-white/5 pt-2">Grid-tied configuration</p>
          </div>
          <div className="bento-card p-5 border-t-2 border-t-brand-500">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-faint mb-1">Panel Count</p>
            <p className="text-3xl font-black text-white">{panelCount}<span className="text-sm text-text-muted ml-1">Panels</span></p>
            <p className="text-xs text-text-secondary mt-2 border-t border-white/5 pt-2">Assuming 550W Tier-1 Mono</p>
          </div>
          <div className="bento-card p-5 border-t-2 border-t-red-500">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-faint mb-1">Estimated Cost</p>
            <p className="text-3xl font-black text-white">₱{(estimatedCost / 1000).toFixed(0)}<span className="text-sm text-text-muted ml-1">k</span></p>
            <p className="text-xs text-text-secondary mt-2 border-t border-white/5 pt-2">Approx. turnkey install price</p>
          </div>
        </div>

        <div className="bento-card p-8 md:p-10 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(10,10,15,0.8) 100%)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-[80px] pointer-events-none rounded-full" />
          
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <BarChart4 className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-xl">Investment Return Profile</h3>
              <p className="text-sm text-text-muted">Financial trajectory over a 10-year lifespan</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 relative z-10">
            <div>
               <div className="mb-6">
                 <p className="text-xs font-bold text-text-faint uppercase tracking-wider mb-1">Monthly Bill Reduction</p>
                 <p className="text-4xl font-black text-emerald-400">₱{actualSavings.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                 <p className="text-sm text-emerald-400/60 mt-1 font-medium">~{Math.round((actualSavings / (kwh * rate)) * 100)}% offset of current bill</p>
               </div>
               
               <div>
                 <p className="text-xs font-bold text-text-faint uppercase tracking-wider mb-1">Break-Even Timeline</p>
                 <div className="flex items-end gap-2">
                    <p className="text-4xl font-black text-white">{paybackYears}</p>
                    <p className="text-lg text-text-muted mb-1 font-medium">Years</p>
                 </div>
               </div>
            </div>

            <div className="flex flex-col justify-end">
              <div className="p-5 rounded-2xl border border-brand-500/30 bg-brand-500/10 relative">
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-brand-500 text-black flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                  <Calculator className="w-4 h-4" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-400 mb-1">10-Year Net Profit</p>
                <p className="text-3xl font-black text-white">₱{tenYearROI.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                <p className="text-xs text-text-secondary mt-2">Total savings minus initial capital expenditure.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
