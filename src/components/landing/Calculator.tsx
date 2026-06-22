'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';

const VECO_RATE = 10.5;

export function Calculator() {
  const t = useTranslations('calculator');
  const [bill, setBill] = useState<number>(5000);

  const estimatedKwh = Math.round(bill / VECO_RATE);
  const requiredSystemSize = Math.max(1, Math.round((estimatedKwh / 30 / 4.5) * 10) / 10);
  const estimatedSavings = Math.round(bill * 0.7);

  return (
    <section id="calculator" className="py-24 bg-[#08080B] relative">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
            {t('title')}
          </h2>
          <p className="text-gray-400">{t('subtitle')}</p>
        </div>

        <div className="glass-panel rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {t('monthlyBill')}
                </label>
                <div className="flex items-center justify-between text-2xl font-bold text-white mb-4">
                  <span>₱1,000</span>
                  <span className="text-accent-cyan">₱{bill.toLocaleString()}</span>
                  <span>₱50,000+</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="500"
                  value={bill}
                  onChange={(e) => setBill(Number(e.target.value))}
                  className="w-full h-2 bg-[#16161D] rounded-lg appearance-none cursor-pointer accent-accent-cyan"
                />
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-sm text-gray-400 mb-1">{t('estimatedUsage')}</p>
                <p className="text-xl font-bold text-white">{estimatedKwh} kWh</p>
                <p className="text-xs text-gray-500 mt-2">
                  {t('rateNote', { rate: VECO_RATE })}
                </p>
              </div>
            </div>

            <div className="bg-[#0F0F14] border border-white/10 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-cyan to-accent-emerald" />
              <h3 className="text-lg font-medium text-white mb-6">{t('recommended')}</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{t('pvSize')}</p>
                  <p className="text-3xl font-bold text-accent-cyan">{requiredSystemSize} kWp</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">{t('monthlySavings')}</p>
                  <p className="text-3xl font-bold text-accent-emerald">
                    ₱{estimatedSavings.toLocaleString()}
                  </p>
                </div>
                <div className="pt-6 border-t border-white/10">
                  <Link
                    href="/contact"
                    className="block w-full py-3 text-center bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    {t('getProposal')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
