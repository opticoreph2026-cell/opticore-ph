'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ClipboardCheck, Ruler, Wrench } from 'lucide-react';
import Image from 'next/image';

export function HowItWorks() {
  const t = useTranslations('howItWorks');

  const steps = [
    {
      icon: ClipboardCheck,
      image: '/site-visit.png',
      title: t('step1Title'),
      desc: t('step1Desc'),
      color: 'text-accent-blue',
      bg: 'bg-accent-blue/10',
    },
    {
      icon: Ruler,
      image: '/system-design.png',
      title: t('step2Title'),
      desc: t('step2Desc'),
      color: 'text-accent-cyan',
      bg: 'bg-accent-cyan/10',
    },
    {
      icon: Wrench,
      image: '/installation.jpg',
      title: t('step3Title'),
      desc: t('step3Desc'),
      color: 'text-accent-emerald',
      bg: 'bg-accent-emerald/10',
    },
  ];

  return (
    <section className="py-24 bg-surface-900/50 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
            {t('title')}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="group"
            >
              <div className="bento-card p-0 overflow-hidden h-full hover:border-white/20 transition-colors">
                <div className="relative h-48 overflow-hidden bg-surface-800">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-900 to-transparent" />
                </div>
                <div className="p-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${step.bg}`}>
                    <step.icon className={`w-5 h-5 ${step.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
