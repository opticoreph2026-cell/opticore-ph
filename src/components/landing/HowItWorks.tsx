'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ClipboardCheck, Ruler, Wrench } from 'lucide-react';
import Image from 'next/image';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

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
    <section className="py-24 bg-surface-50 dark:bg-surface-900/30 relative">
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
          <p className="text-foreground-muted max-w-2xl mx-auto">{t('subtitle')}</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {steps.map((step, index) => (
            <motion.div key={step.title} variants={itemVariants} className="group">
              <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl p-0 overflow-hidden h-full hover:border-black/20 dark:hover:border-white/20 transition-colors shadow-sm">
                <div className="relative h-48 overflow-hidden bg-surface-200 dark:bg-surface-800">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 dark:from-surface-900/80 to-transparent" />
                </div>
                <div className="p-6 relative">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${step.bg} backdrop-blur-sm`}>
                    <step.icon className={`w-5 h-5 ${step.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-foreground-muted leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
