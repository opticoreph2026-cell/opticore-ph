'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, ArrowRight, Sparkles } from 'lucide-react';
import { ThreeScene } from './ThreeScene';

export function Hero3D() {
  const t = useTranslations('hero');
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.9]);
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <ThreeScene />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-primary/30 to-bg-primary pointer-events-none z-[1]" />

      {/* Content */}
      <motion.div
        style={{ opacity, scale, y }}
        className="relative z-10 max-w-6xl mx-auto px-6 text-center pt-24 pb-16"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-blue/10 dark:bg-white/5 border border-accent-blue/20 dark:border-white/10 mb-8 backdrop-blur-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-accent-blue" />
          <span className="text-sm font-medium text-accent-blue dark:text-gray-300">{t('badge')}</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-display font-bold tracking-tight text-foreground dark:text-white mb-6 leading-[0.9]"
        >
          {t('title')}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue via-accent-cyan to-accent-emerald">
            {t('titleHighlight')}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-foreground-muted dark:text-gray-400 max-w-2xl mx-auto mb-10 font-body leading-relaxed"
        >
          {t('subtitle')}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/contact"
            className="group px-8 py-4 bg-accent-blue text-white font-semibold rounded-full hover:bg-accent-blue/90 transition-all transform hover:scale-105 shadow-[0_0_40px_rgba(37,99,235,0.3)] flex items-center gap-2"
          >
            {t('ctaPrimary')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/calculator"
            className="px-8 py-4 bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 text-foreground dark:text-white font-semibold rounded-full hover:bg-white/10 dark:hover:bg-white/10 hover:bg-black/5 transition-all"
          >
            {t('ctaSecondary')}
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-foreground-muted dark:text-white/30 font-mono uppercase tracking-widest">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-4 h-4 text-foreground-muted dark:text-white/30" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
