'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative min-h-[820px] flex items-center justify-center overflow-hidden pt-20">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
        {/* Badge / Pill */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/30 opt-pill cursor-default">
            <span className="w-2 h-2 rounded-full bg-primary-500 opt-pulse-dot" />
            <span className="text-sm font-medium text-primary-500">{t('badge')}</span>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight text-foreground-950 mb-6 leading-tight"
        >
          {t('title')}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500">
            {t('titleHighlight')}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="text-lg md:text-xl text-foreground-600 max-w-2xl mx-auto mb-10"
        >
          {t('subtitle')}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/contact"
            className="cta-primary px-8 py-3.5 rounded-xl bg-primary-500 text-background-50 font-semibold flex items-center gap-2"
          >
            {t('ctaPrimary')}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/calculator"
            className="cta-glass px-8 py-3.5 rounded-xl bg-background-100/60 border border-foreground-950/10 text-foreground-950 font-semibold backdrop-blur-md"
          >
            {t('ctaSecondary')}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
