'use client';

import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    num: '01',
    title: 'Site Survey & Load Profiling',
    desc: 'Our engineers deploy loggers to measure your exact load profile and inspect your roof/electrical room.',
  },
  {
    num: '02',
    title: 'System Design & ROI',
    desc: 'We present a detailed single-line diagram and a dual-rate ROI model during an in-person consultation.',
  },
  {
    num: '03',
    title: 'Permitting',
    desc: 'We handle all LGU, OBO, and DU (Meralco/VECO) paperwork before any installation begins.',
  },
  {
    num: '04',
    title: 'Installation',
    desc: 'Our certified installers deploy the Neovolt ESS following strict Philippine Electrical Code standards.',
  },
  {
    num: '05',
    title: 'Commissioning & Testing',
    desc: 'We simulate grid failures to ensure the 20ms transfer switch activates perfectly for your critical loads.',
  },
  {
    num: '06',
    title: 'Turnover & App Access',
    desc: 'You receive full documentation, warranties, and access to the mobile monitoring app.',
  },
];

export function Process() {
  return (
    <section className="py-24 bg-[#08080B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Delivery Process</h2>
          <p className="text-gray-400 text-lg">
            Engineering precision from first contact to final turnover. No guesswork.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="p-6 border-l-2 border-[#16161D] hover:border-[#F5A524] transition-colors relative"
            >
              <div className="text-4xl font-black text-white/5 absolute top-2 left-4">{step.num}</div>
              <div className="relative z-10 pt-4">
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
