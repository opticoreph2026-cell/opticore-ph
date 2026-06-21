'use client';

import React, { useState } from 'react';

export function Calculator() {
  const [bill, setBill] = useState(2500);
  const [months, setMonths] = useState(12);

  const potentialSavingsRate = 0.15; // Assume we can find 15% savings via AI/ghost loads
  const monthlySavings = bill * potentialSavingsRate;
  const totalSavings = monthlySavings * months;

  return (
    <section id="calculator" className="py-24 bg-surface-900 border-y border-border-subtle relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-cyan/5 rounded-full blur-[80px] pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <h2 className="text-sm font-semibold text-accent-cyan tracking-wider uppercase mb-3">Savings Potential</h2>
            <p className="text-3xl md:text-4xl font-display font-bold text-white mb-6 leading-tight">
              See how much you could save by finding ghost loads.
            </p>
            <p className="text-lg text-white/60 mb-8">
              On average, our users discover that 10% to 15% of their electricity bill is wasted on inefficient appliances or standby power. Let OptiCore find them for you.
            </p>
            
            <div className="space-y-8 p-8 bg-surface-1000 border border-border-subtle rounded-2xl shadow-2xl">
              <div>
                <label className="flex justify-between text-sm font-medium text-white mb-4">
                  <span>Average Monthly Bill</span>
                  <span className="text-accent-cyan font-mono">₱ {bill.toLocaleString()}</span>
                </label>
                <input 
                  type="range" 
                  min="500" 
                  max="15000" 
                  step="100"
                  value={bill}
                  onChange={(e) => setBill(parseInt(e.target.value))}
                  className="w-full h-2 bg-surface-800 rounded-lg appearance-none cursor-pointer accent-accent-cyan"
                />
                <div className="flex justify-between text-xs text-white/40 mt-2 font-mono">
                  <span>₱500</span>
                  <span>₱15,000+</span>
                </div>
              </div>

              <div>
                <label className="flex justify-between text-sm font-medium text-white mb-4">
                  <span>Timeframe</span>
                  <span className="text-accent-emerald font-mono">{months} Months</span>
                </label>
                <input 
                  type="range" 
                  min="1" 
                  max="36" 
                  value={months}
                  onChange={(e) => setMonths(parseInt(e.target.value))}
                  className="w-full h-2 bg-surface-800 rounded-lg appearance-none cursor-pointer accent-accent-emerald"
                />
                <div className="flex justify-between text-xs text-white/40 mt-2 font-mono">
                  <span>1m</span>
                  <span>36m</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-surface-800 to-surface-1000 border border-border-subtle rounded-3xl shadow-2xl text-center relative overflow-hidden">
             {/* Glow effect inside card */}
             <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/10 to-transparent pointer-events-none"></div>

             <h3 className="text-xl font-medium text-white/80 mb-2 relative z-10">Estimated Savings</h3>
             <div className="flex items-start justify-center gap-1 mb-8 relative z-10">
               <span className="text-2xl font-bold text-accent-cyan mt-2">₱</span>
               <span className="text-7xl font-display font-bold text-white tracking-tight">
                 {totalSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
               </span>
             </div>

             <div className="w-full h-px bg-gradient-to-r from-transparent via-border-glow to-transparent mb-8"></div>

             <div className="grid grid-cols-2 gap-8 w-full relative z-10">
               <div>
                 <p className="text-sm text-white/40 mb-1">Monthly</p>
                 <p className="text-xl font-semibold text-white">₱ {monthlySavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
               </div>
               <div>
                 <p className="text-sm text-white/40 mb-1">Yearly Equivalent</p>
                 <p className="text-xl font-semibold text-white">₱ {(monthlySavings * 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
               </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
