'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Award, ShieldCheck, MapPin } from 'lucide-react';

export function TrustBar() {
  const t = useTranslations('trustBar');

  const badges = [
    { icon: Award, label: t('rme'), color: 'text-primary-500', bg: 'bg-primary-500/10' },
    { icon: ShieldCheck, label: t('partner'), color: 'text-accent-500', bg: 'bg-accent-500/10' },
    { icon: MapPin, label: t('coverage'), color: 'text-secondary-500', bg: 'bg-secondary-500/10' },
  ];

  return (
    <section className="py-10 relative">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
              className={`flex items-center gap-3 px-5 py-4 rounded-xl ${badge.bg} border border-foreground-950/10 backdrop-blur-sm`}
            >
              <badge.icon className={`w-6 h-6 ${badge.color} flex-shrink-0`} />
              <span className="text-sm font-medium text-foreground-950">{badge.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
