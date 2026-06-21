'use client';

import React from 'react';

export function Coverage() {
  return (
    <section className="py-24 bg-[#0F0F14] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#06B6D4] text-sm font-semibold tracking-wider uppercase mb-6">
              Coverage Area
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Strong Presence Across the Visayas
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Based in Cebu, OptiCore Energy Solutions partners with top local engineering teams across the region to ensure fast deployment, localized permitting, and rapid maintenance response.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-[#F5A524] mt-2 mr-4" />
                <div>
                  <h4 className="text-white font-bold mb-1">Cebu & Bohol</h4>
                  <p className="text-sm text-gray-500">Direct OptiCore Operations & Engr. Jeric Inson's Team</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-[#06B6D4] mt-2 mr-4" />
                <div>
                  <h4 className="text-white font-bold mb-1">Eastern Visayas (Leyte, Samar)</h4>
                  <p className="text-sm text-gray-500">SidlakDev Leyte / Aldrean T. Polistico, ECE</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-[#10B981] mt-2 mr-4" />
                <div>
                  <h4 className="text-white font-bold mb-1">Nationwide Projects</h4>
                  <p className="text-sm text-gray-500">By request for Commercial & Industrial scales</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            {/* Abstract visual representation of a map/network */}
            <div className="aspect-square rounded-full border border-white/10 relative flex items-center justify-center p-8 overflow-hidden bg-[#16161D]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#06B6D4]/10 via-transparent to-transparent opacity-50" />
              <div className="w-full h-full rounded-full border border-dashed border-white/20 animate-[spin_60s_linear_infinite]" />
              <div className="w-3/4 h-3/4 absolute rounded-full border border-dashed border-[#F5A524]/30 animate-[spin_40s_linear_infinite_reverse]" />
              
              <div className="absolute top-1/3 left-1/3 w-4 h-4 bg-[#F5A524] rounded-full shadow-[0_0_20px_#F5A524]" />
              <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-[#06B6D4] rounded-full shadow-[0_0_15px_#06B6D4]" />
              <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-[#10B981] rounded-full shadow-[0_0_15px_#10B981]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
