'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#08080B] pt-20">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-emerald/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
          <span className="text-sm font-medium text-gray-300">Intelligent Energy Management for the Philippines</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-7xl font-display font-bold tracking-tight text-white mb-6 leading-tight"
        >
          Master Your Power with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-emerald">
            OptiCore PH
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 font-body"
        >
          Advanced analytics, precision Solar &amp; ESS sizing, and smart marketplace integrations. We turn your energy bills into assets.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/onboarding"
            className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-all transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            Start Assessment
          </Link>
          <Link
            href="#calculator"
            className="px-8 py-4 bg-[#16161D] border border-white/10 text-white font-semibold rounded-full hover:bg-white/5 transition-all"
          >
            Calculate ROI
          </Link>
        </motion.div>
      </div>
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.03] pointer-events-none" />
    </section>
  );
};
