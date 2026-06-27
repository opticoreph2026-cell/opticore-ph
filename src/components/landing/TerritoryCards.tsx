'use client';

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
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export function TerritoryCards() {
  const t = useTranslations('territory');

  const territories = [
    { key: 'cebu', borderColor: 'border-l-primary-500' },
    { key: 'bohol', borderColor: 'border-l-accent-500' },
    { key: 'leyte', borderColor: 'border-l-secondary-500' },
  ] as const;

  return (
    <section className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground-950 mb-4">
            {t('title')}
          </h2>
          <p className="text-foreground-600">{t('subtitle')}</p>
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
              className={`bento-card border-l-4 ${territory.borderColor}`}
            >
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-foreground-600" />
                <h3 className="text-lg font-bold text-foreground-950">{t(`${territory.key}`)}</h3>
              </div>
              <p className="text-sm text-foreground-600 leading-relaxed">
                {t(`${territory.key}Desc`)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
