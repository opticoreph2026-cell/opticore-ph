'use client';

import React from 'react';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Zero-Export Hybrid Architecture',
    description: 'Avoid DU regulatory delays. Operate entirely behind the meter while maximizing self-consumption.',
    icon: (
      <svg className="w-6 h-6 text-[#F5A524]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Bank-Grade LFP Batteries',
    description: 'Neovolt ESS uses premium Tier-1 Lithium Iron Phosphate cells with a 6,000-cycle life and 10-year warranty.',
    icon: (
      <svg className="w-6 h-6 text-[#06B6D4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    title: 'Seamless Backup Power',
    description: '20ms automatic transfer switch keeps your critical loads running during brownouts without interruption.',
    icon: (
      <svg className="w-6 h-6 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
];

export function Features() {
  return (
    <section className="py-24 bg-[#0F0F14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose OptiCore?</h2>
          <p className="text-gray-400 text-lg">
            We don't just install solar panels. We engineer resilient energy systems designed specifically for the Philippine grid's unique challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#16161D] p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
