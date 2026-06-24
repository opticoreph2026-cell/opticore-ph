'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronUp } from 'lucide-react';

export function ScrollToTop() {
  const t = useTranslations('scrollToTop');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 left-6 z-50 w-10 h-10 rounded-full bg-surface-800 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-surface-700 transition-all shadow-lg"
      aria-label={t('ariaLabel')}
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
}
