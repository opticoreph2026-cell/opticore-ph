'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

const slides = [
  { image: '/hero-bg.png' },
  { image: '/commercial.png' },
  { image: '/residential.png' },
  { image: '/solar-panel.png' },
  { image: '/sunset.png' },
];

export function Hero() {
  const t = useTranslations('hero');
  const [currentSlide, setCurrentSlide] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[80vh] md:h-screen flex items-center justify-center overflow-hidden pt-20">
      {slides.map((slide, index) => (
        <motion.div
          key={slide.image}
          role="img"
          aria-label="OptiCore Energy Solutions solar energy background"
          style={{
            y: index === currentSlide ? bgY : 0,
            backgroundImage: `url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-40' : 'opacity-0'
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-[rgba(26,42,58,0.6)] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-4 py-1.5 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
          <span className="text-sm font-medium text-gray-300">{t('badge')}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight text-white mb-6 leading-tight"
        >
          {t('title')}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-accent-cyan">
            {t('titleHighlight')}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 font-body"
        >
          {t('subtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/contact"
            className="px-8 py-4 bg-accent-blue text-white font-semibold rounded-full hover:bg-accent-blue/90 transition-all transform hover:scale-105 shadow-[0_0_40px_rgba(37,99,235,0.3)]"
          >
            {t('ctaPrimary')}
          </Link>
          <Link
            href="/calculator"
            className="px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 text-white font-semibold rounded-full hover:bg-white/10 transition-all"
          >
            {t('ctaSecondary')}
          </Link>
        </motion.div>

        <div className="flex items-center justify-center gap-2 mt-8">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-accent-blue w-6' : 'bg-white/20'
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
