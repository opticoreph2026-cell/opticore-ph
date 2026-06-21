'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const Calculator = () => {
  const [bill, setBill] = useState<number>(5000);
  const rate = 11.42; // Example average rate per kWh
  const estimatedKwh = Math.round(bill / rate);
  
  // Very rough solar estimation: ~4.5 peak sun hours, 30 days
  const requiredSystemSize = Math.max(1, Math.round((estimatedKwh / 30 / 4.5) * 10) / 10);
  const estimatedSavings = Math.round(bill * 0.7); // 70% offset

  return (
    <section id="calculator" className="py-24 bg-[#08080B] relative">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
            Calculate Your Solar Potential
          </h2>
          <p className="text-gray-400">
            See how much you could save with a tailored solar setup.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Input Side */}
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Average Monthly Electric Bill (₱)
                </label>
                <div className="flex items-center justify-between text-2xl font-bold text-white mb-4">
                  <span>₱1,000</span>
                  <span className="text-accent-cyan">₱{bill.toLocaleString()}</span>
                  <span>₱50,000+</span>
                </div>
                <input 
                  type="range" 
                  min="1000" 
                  max="50000" 
                  step="500"
                  value={bill}
                  onChange={(e) => setBill(Number(e.target.value))}
                  className="w-full h-2 bg-[#16161D] rounded-lg appearance-none cursor-pointer accent-accent-cyan"
                />
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-sm text-gray-400 mb-1">Estimated Monthly Usage</p>
                <p className="text-xl font-bold text-white">{estimatedKwh} kWh</p>
                <p className="text-xs text-gray-500 mt-2">Based on estimated rate of ₱{rate}/kWh</p>
              </div>
            </div>

            {/* Results Side */}
            <div className="bg-[#0F0F14] border border-white/10 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-cyan to-accent-emerald" />
              
              <h3 className="text-lg font-medium text-white mb-6">Recommended System</h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Solar PV Array Size</p>
                  <p className="text-3xl font-bold text-accent-cyan">{requiredSystemSize} kWp</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Estimated Monthly Savings</p>
                  <p className="text-3xl font-bold text-accent-emerald">₱{estimatedSavings.toLocaleString()}</p>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <a 
                    href="/onboarding"
                    className="block w-full py-3 text-center bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Get Detailed Proposal
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
