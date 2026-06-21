'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#08080B] pt-24 pb-32 lg:pt-36 lg:pb-40">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#08080B]" />
        {/* Decorative background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#F5A524]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#F5A524] text-sm font-semibold tracking-wider uppercase mb-8">
            OptiCore Energy Solutions
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
            Future-Proof Your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A524] to-[#06B6D4]">
              Energy Independence
            </span>
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10">
            Premium Neovolt ESS solar installations tailored for Philippine homes and businesses. 
            Reduce bills, survive outages, and take control of your power.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#calculator"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-lg text-[#08080B] bg-[#F5A524] hover:bg-[#e0961f] transition-all duration-200"
            >
              Calculate ROI
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-lg text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
            >
              Get a Quote
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
