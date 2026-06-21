'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  Zap as LightningBoltIcon, 
  BarChart3 as ChartBarIcon, 
  CircleDollarSign as CurrencyDollarIcon,
  Globe as GlobeAltIcon
} from 'lucide-react';

const features = [
  {
    title: 'Precision Load Assessment',
    description: 'Calculate your exact energy requirements with our advanced load profiling tools tailored for Philippine households and SMEs.',
    icon: ChartBarIcon,
    color: 'text-accent-cyan',
    bg: 'bg-accent-cyan/10'
  },
  {
    title: 'Solar & ESS Sizing',
    description: 'Generate accurate system designs and BOMs. We support Grid-Tied, Zero-Export Hybrid, and Off-Grid pathways.',
    icon: LightningBoltIcon,
    color: 'text-accent-amber',
    bg: 'bg-accent-amber/10'
  },
  {
    title: 'Dynamic ROI Modeling',
    description: 'Calculate payback periods against exact Meralco and regional DU rate schedules, including time-of-use and tiering.',
    icon: CurrencyDollarIcon,
    color: 'text-accent-emerald',
    bg: 'bg-accent-emerald/10'
  },
  {
    title: 'Nationwide Support',
    description: 'Built specifically for the Philippine market, tracking ERC regulations and local utility billing behaviors.',
    icon: GlobeAltIcon,
    color: 'text-accent-rose',
    bg: 'bg-accent-rose/10'
  }
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

export const Features = () => {
  return (
    <section className="py-24 bg-[#0F0F14] relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold text-accent-cyan tracking-wider uppercase mb-3">The Platform</h2>
          <p className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
            Intelligence at every step.
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto">
            From initial assessment to final commissioning, OptiCore PH provides the digital infrastructure to modernize energy transitions.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              className="bento-card hover:bg-[#16161D] transition-colors group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.bg}`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-3 font-display group-hover:text-white transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed font-body">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
