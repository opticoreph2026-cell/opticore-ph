'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

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
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
            {t('title')}
          </h2>
          <p className="text-gray-400">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {territories.map((territory, index) => (
            <motion.div
              key={territory.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`bento-card border-l-4 ${territory.color}`}
            >
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-white/60" />
                <h3 className="text-lg font-bold text-white">{t(`${territory.key}`)}</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                {t(`${territory.key}Desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
