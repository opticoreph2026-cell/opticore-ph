'use client';

import React from 'react';
import { motion } from 'framer-motion';

const tiers = [
  {
    name: 'Starter Residential',
    description: 'Perfect for small households looking to backup essentials and reduce daytime bills.',
    inverter: '3.6kW Single-Phase',
    battery: '10.1kWh LFP',
    features: ['Backs up lights, fans, fridge, internet', 'Reduces bill by up to ₱4,000/mo', 'Zero-export ready'],
  },
  {
    name: 'Standard Residential',
    description: 'Our most popular tier. Run a 1HP inverter aircon off-grid through the night.',
    inverter: '5kW Single-Phase',
    battery: '10.1kWh LFP',
    features: ['Backs up 1 AC unit + essentials', 'Reduces bill by up to ₱6,500/mo', 'Zero-export ready', 'Expandable battery'],
    popular: true,
  },
  {
    name: 'Small Commercial',
    description: 'Designed for clinics, small offices, and large homes with 3-phase power.',
    inverter: '10kW Three-Phase',
    battery: '19.2kWh LFP (Stacked)',
    features: ['Full phase balancing', 'High surge capacity for motors', 'Reduces bill by up to ₱15,000/mo', 'Net-metering ready'],
  },
];

export function Products() {
  return (
    <section className="py-24 bg-[#08080B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Neovolt ESS Packages</h2>
          <p className="text-gray-400 text-lg">
            Turnkey solutions tailored to your load profile. Exact pricing requires a site survey and load analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {tiers.map((tier, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative bg-[#0F0F14] p-8 rounded-2xl border ${
                tier.popular ? 'border-[#F5A524]' : 'border-white/5'
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-[#F5A524] text-[#08080B] text-sm font-bold uppercase tracking-wide rounded-full">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
              <p className="text-gray-400 mb-6 text-sm">{tier.description}</p>
              
              <div className="mb-6 space-y-3">
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-20">Inverter:</span>
                  <span className="text-white font-medium">{tier.inverter}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-20">Battery:</span>
                  <span className="text-white font-medium">{tier.battery}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feat, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-300">
                    <svg className="w-5 h-5 text-[#10B981] mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                tier.popular 
                  ? 'bg-[#F5A524] text-[#08080B] hover:bg-[#e0961f]' 
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}>
                Request Quote
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
