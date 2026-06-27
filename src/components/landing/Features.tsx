'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Award, MapPin, Target, Globe, Zap, CircleDollarSign } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

export function Features() {
  const t = useTranslations('features');

  const features = [
    { key: 'loadAssessment', icon: Zap, color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
    { key: 'sizing', icon: Award, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10' },
    { key: 'roi', icon: CircleDollarSign, color: 'text-accent-emerald', bg: 'bg-accent-emerald/10' },
    { key: 'coverage', icon: Globe, color: 'text-accent-rose', bg: 'bg-accent-rose/10' },
  ] as const;

  return (
    <section id="solutions" className="py-24 bg-surface-100/50 dark:bg-surface-900/20 relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-sm font-semibold text-accent-blue tracking-wider uppercase mb-3">
            {t('eyebrow')}
          </h2>
          <p className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            {t('title')}
          </p>
          <p className="text-foreground-muted max-w-2xl mx-auto">{t('subtitle')}</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.key}
              variants={itemVariants}
              className="bg-white dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:bg-gray-50 dark:hover:bg-white/[0.07] transition-colors group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.bg} backdrop-blur-sm`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3 font-display">
                {t(`${feature.key}.title`)}
              </h3>
              <p className="text-sm text-foreground-muted leading-relaxed font-body">
                {t(`${feature.key}.description`)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
