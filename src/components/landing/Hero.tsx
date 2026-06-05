'use client';

import React from 'react';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-accent-cyan/10 to-transparent pointer-events-none"></div>
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-accent-emerald/10 rounded-full blur-[100px] pointer-events-none translate-x-1/2"></div>
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-accent-cyan/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tight mb-8 leading-tight max-w-4xl mx-auto">
          Take control of your <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-emerald">
            utility bills
          </span> today.
        </h1>
        
        <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
          The unified utility intelligence platform for Philippine households. Track electricity, water, and fuel expenses. Identify energy hogs and reduce your monthly spending with AI.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup" className="w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-xl bg-gradient-to-r from-accent-cyan to-accent-emerald text-white hover:opacity-90 transition-opacity shadow-lg shadow-accent-cyan/20">
            Start Free Trial
          </Link>
          <Link href="#features" className="w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-xl bg-surface-800 text-white hover:bg-surface-800/80 border border-border-subtle transition-colors">
            See How it Works
          </Link>
        </div>

        {/* Dashboard Preview Image Placeholder */}
        <div className="mt-20 relative mx-auto max-w-5xl">
          <div className="rounded-2xl border border-border-subtle bg-surface-900/50 backdrop-blur-sm p-2 shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-t from-surface-1000 via-transparent to-transparent z-10 rounded-2xl"></div>
            <div className="aspect-video bg-surface-800 rounded-xl flex items-center justify-center border border-border-subtle overflow-hidden">
               {/* Decorative Dashboard Skeleton */}
               <div className="w-full h-full p-6 flex flex-col gap-4">
                  <div className="h-10 w-48 bg-white/5 rounded-lg"></div>
                  <div className="flex gap-4">
                    <div className="h-32 flex-1 bg-white/5 rounded-lg"></div>
                    <div className="h-32 flex-1 bg-white/5 rounded-lg"></div>
                    <div className="h-32 flex-1 bg-white/5 rounded-lg"></div>
                  </div>
                  <div className="h-64 w-full bg-white/5 rounded-lg mt-4"></div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
