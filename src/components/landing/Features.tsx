'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Zap, Award, CircleDollarSign, Globe } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export function Features() {
  const t = useTranslations('features');

  const features = [
    { key: 'loadAssessment', icon: Zap, scheme: 'primary' as const },
    { key: 'sizing', icon: Award, scheme: 'accent' as const },
    { key: 'roi', icon: CircleDollarSign, scheme: 'secondary' as const },
    { key: 'coverage', icon: Globe, scheme: 'primary' as const },
  ];

  const schemeClasses = {
    primary: { text: 'text-primary-500', bg: 'bg-primary-500/10', border: 'border-primary-500/20' },
    accent: { text: 'text-accent-500', bg: 'bg-accent-500/10', border: 'border-accent-500/20' },
    secondary: { text: 'text-secondary-500', bg: 'bg-secondary-500/10', border: 'border-secondary-500/20' },
  } as const;

  return (
    <section id="solutions" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary-500 tracking-wider uppercase mb-3 block">
            {t('eyebrow')}
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground-950 mb-4">
            {t('title')}
          </h2>
          <p className="text-foreground-600 max-w-2xl mx-auto">{t('subtitle')}</p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => {
            const s = schemeClasses[feature.scheme];
            return (
              <motion.div key={feature.key} variants={itemVariants}>
                <div className="bento-card h-full hover:bg-background-100/60 transition-colors">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${s.bg}`}>
                    <feature.icon className={`w-6 h-6 ${s.text}`} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground-950 mb-3 font-display">
                    {t(`${feature.key}.title`)}
                  </h3>
                  <p className="text-sm text-foreground-600 leading-relaxed">
                    {t(`${feature.key}.description`)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
