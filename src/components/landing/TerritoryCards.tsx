'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

export function TerritoryCards() {
  const t = useTranslations('territory');

  const territories = [
    { key: 'cebu', color: 'border-l-accent-blue' },
    { key: 'bohol', color: 'border-l-accent-cyan' },
    { key: 'leyte', color: 'border-l-accent-emerald' },
  ] as const;

  return (
    <section className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            {t('title')}
          </h2>
          <p className="text-foreground-muted">{t('subtitle')}</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {territories.map((territory) => (
            <motion.div
              key={territory.key}
              variants={itemVariants}
              className={`bg-white dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl p-6 shadow-sm border-l-4 ${territory.color}`}
            >
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-foreground-muted" />
                <h3 className="text-lg font-bold text-foreground">{t(`${territory.key}`)}</h3>
              </div>
              <p className="text-sm text-foreground-muted leading-relaxed">
                {t(`${territory.key}Desc`)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
