'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

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
    <section ref={sectionRef} className="relative min-h-[820px] flex items-center justify-center overflow-hidden pt-20">
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
            index === currentSlide ? 'opacity-80' : 'opacity-0'
          }`}
        />
      ))}
      {/* Navy overlay per Readdy Version 4 */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent-950/20 via-accent-950/10 to-accent-950/15 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
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

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="text-lg md:text-xl text-foreground-600 max-w-2xl mx-auto mb-10"
        >
          {t('subtitle')}
        </motion.p>

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

        <div className="flex items-center justify-center gap-2 mt-8">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-primary-500 w-6' : 'bg-foreground-950/20'
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
