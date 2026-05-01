'use client';

import { useState, useMemo } from 'react';
import { Sliders, Zap, TrendingDown } from 'lucide-react';
import SpotlightCard from '@/components/ui/SpotlightCard';

export default function WhatIfSimulator({ appliances, effectiveRate = 11.5 }) {
  // Only target heavy appliances like AC, Heater, Fridge
  const targetAppliances = useMemo(() => {
    return appliances.filter(a => 
      a.category === 'aircon' || 
      a.category === 'water_heater' || 
      a.wattage > 1000
    );
  }, [appliances]);

  const [adjustments, setAdjustments] = useState({});

  if (targetAppliances.length === 0) return null;

  const handleSliderChange = (id, newHours) => {
    setAdjustments(prev => ({
      ...prev,
      [id]: newHours
    }));
  };

  const calculateSavings = () => {
    let totalMonthlySavings = 0;
    
    targetAppliances.forEach(app => {
      const currentHours = app.hoursPerDay || 0;
      const adjustedHours = adjustments[app.id] !== undefined ? adjustments[app.id] : currentHours;
      
      if (adjustedHours < currentHours) {
        const hoursSavedPerDay = currentHours - adjustedHours;
        const kwhSavedPerMonth = (app.wattage * hoursSavedPerDay * 30 * (app.quantity || 1)) / 1000;
        totalMonthlySavings += kwhSavedPerMonth * effectiveRate;
      }
    });
    
    return totalMonthlySavings;
  };

  const savings = calculateSavings();

  return (
    <SpotlightCard className="p-8 bg-surface-1000/20 backdrop-blur-md border-white/5 h-full flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <Sliders className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">₱ What-If Simulator</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Adjust usage to see potential savings</p>
        </div>
      </div>

      <div className="space-y-6 flex-1">
        {targetAppliances.map(app => {
          const currentHours = app.hoursPerDay || 0;
          const adjustedHours = adjustments[app.id] !== undefined ? adjustments[app.id] : currentHours;
          
          return (
            <div key={app.id} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-300">{app.name}</span>
                <span className="text-cyan-400 font-bold tabular-nums">
                  {adjustedHours} <span className="text-[10px] uppercase tracking-widest text-slate-500">hrs/day</span>
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max={Math.max(24, currentHours)} 
                step="0.5"
                value={adjustedHours}
                onChange={(e) => handleSliderChange(app.id, parseFloat(e.target.value))}
                className="w-full accent-cyan-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0 hrs</span>
                <span>Original: {currentHours} hrs</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex items-end justify-between">
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.25em] mb-1">Projected Monthly Savings</p>
          <div className="flex items-center gap-2">
            <TrendingDown className={`w-5 h-5 ${savings > 0 ? 'text-emerald-400' : 'text-slate-600'}`} />
            <span className={`text-3xl font-black tabular-nums ${savings > 0 ? 'text-emerald-400' : 'text-white'}`}>
              ₱{savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center">
          <Zap className={`w-4 h-4 ${savings > 0 ? 'text-emerald-400' : 'text-slate-600'}`} />
        </div>
      </div>
    </SpotlightCard>
  );
}
