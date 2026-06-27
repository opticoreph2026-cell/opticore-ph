'use client';

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
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export function HowItWorks() {
  const t = useTranslations('howItWorks');

  const steps = [
    {
      icon: ClipboardCheck,
      image: '/site-visit.png',
      title: t('step1Title'),
      desc: t('step1Desc'),
      color: 'text-primary-500',
      bg: 'bg-primary-500/10',
    },
    {
      icon: Ruler,
      image: '/system-design.png',
      title: t('step2Title'),
      desc: t('step2Desc'),
      color: 'text-accent-500',
      bg: 'bg-accent-500/10',
    },
    {
      icon: Wrench,
      image: '/installation.jpg',
      title: t('step3Title'),
      desc: t('step3Desc'),
      color: 'text-secondary-500',
      bg: 'bg-secondary-500/10',
    },
  ];

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
          <p className="text-foreground-600 max-w-2xl mx-auto">{t('subtitle')}</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {steps.map((step) => (
            <motion.div key={step.title} variants={itemVariants} className="group">
              <div className="bento-card p-0 overflow-hidden h-full hover:bg-background-100/60 transition-colors">
                <div className="relative h-48 overflow-hidden bg-background-200">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-50/80 to-transparent" />
                </div>
                <div className="p-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${step.bg}`}>
                    <step.icon className={`w-5 h-5 ${step.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground-950 mb-2">{step.title}</h3>
                  <p className="text-sm text-foreground-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
