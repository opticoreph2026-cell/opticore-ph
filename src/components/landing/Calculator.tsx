'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export function Calculator() {
  const [bill, setBill] = useState(5000);
  const [submitted, setSubmitted] = useState(false);

  // Rough estimation logic for landing page (marketing purposes only)
  // Actual sizing requires the CRM engine.
  const estimatedSavings = Math.round(bill * 0.7);
  const paybackYears = bill > 15000 ? 3.5 : bill > 8000 ? 4.5 : 5.5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real flow, this would POST to /api/energy/leads
    setSubmitted(true);
  };

  return (
    <section id="calculator" className="py-24 bg-[#0F0F14] border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#16161D] rounded-3xl p-8 md:p-12 border border-white/5 shadow-2xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Calculate Your Savings</h2>
            <p className="text-gray-400">Discover how much you could save with a Neovolt ESS system.</p>
          </div>

          {!submitted ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Average Monthly Electricity Bill
                </label>
                <div className="flex items-center mb-8">
                  <span className="text-2xl text-gray-500 mr-2">₱</span>
                  <input
                    type="number"
                    value={bill}
                    onChange={(e) => setBill(Number(e.target.value))}
                    className="w-full bg-transparent border-b-2 border-white/10 text-4xl text-white font-bold focus:border-[#F5A524] focus:ring-0 outline-none transition-colors pb-2"
                  />
                </div>
                <input
                  type="range"
                  min="2000"
                  max="50000"
                  step="1000"
                  value={bill}
                  onChange={(e) => setBill(Number(e.target.value))}
                  className="w-full accent-[#F5A524]"
                />
              </div>

              <div className="bg-[#08080B] p-6 rounded-2xl border border-white/5">
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">Estimated Monthly Savings</p>
                  <p className="text-4xl font-bold text-[#10B981]">₱{estimatedSavings.toLocaleString()}</p>
                </div>
                <div className="mb-8">
                  <p className="text-sm text-gray-500 mb-1">Estimated Payback Period</p>
                  <p className="text-2xl font-bold text-white">{paybackYears} Years</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <button
                    type="submit"
                    className="w-full py-4 bg-[#F5A524] text-[#08080B] font-bold rounded-lg hover:bg-[#e0961f] transition-colors"
                  >
                    Get Detailed Engineering Quote
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-[#10B981]/20 text-[#10B981] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Request Received</h3>
              <p className="text-gray-400">Our engineering team will contact you shortly to schedule a site survey.</p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
