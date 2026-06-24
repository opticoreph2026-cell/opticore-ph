'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Award, ShieldCheck, MapPin } from 'lucide-react';

export function TrustBar() {
  const t = useTranslations('trustBar');

  const badges = [
    { icon: Award, label: t('rme'), color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
    { icon: ShieldCheck, label: t('partner'), color: 'text-accent-cyan', bg: 'bg-accent-cyan/10' },
    { icon: MapPin, label: t('coverage'), color: 'text-accent-emerald', bg: 'bg-accent-emerald/10' },
  ];

  return (
    <section className="py-10 relative">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {badges.map((badge) => (
            <div
              key={badge.label}
              className={`flex items-center gap-3 px-5 py-4 rounded-xl ${badge.bg} border border-white/5`}
            >
              <badge.icon className={`w-6 h-6 ${badge.color} flex-shrink-0`} />
              <span className="text-sm font-medium text-white">{badge.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
