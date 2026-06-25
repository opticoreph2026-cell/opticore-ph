'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Spinner } from '@/components/ui/Spinner';
import { NEOVOLT_INVERTERS_SINGLE } from '@/data/neovolt-products';

const PROVINCES = [
  { id: 'cebu', name: 'Cebu', rate: 10.5 },
  { id: 'bohol', name: 'Bohol', rate: 11.2 },
  { id: 'leyte', name: 'Leyte', rate: 10.8 },
] as const;

const BACKUP_OPTIONS = [
  { id: '4', label: 'hours4', hours: 4 },
  { id: '8', label: 'hours8', hours: 8 },
  { id: '12', label: 'hours12', hours: 12 },
  { id: '24', label: 'hours24', hours: 24 },
] as const;

function round(v: number): number {
  return Math.round(v);
}

export function Calculator() {
  const t = useTranslations('calculator');
  const [bill, setBill] = useState(5000);
  const [province, setProvince] = useState('cebu');
  const [propertyType, setPropertyType] = useState('residential');
  const [backupId, setBackupId] = useState('8');
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedProvince = PROVINCES.find((p) => p.id === province)!;
  const backupOption = BACKUP_OPTIONS.find((b) => b.id === backupId)!;
  const rate = selectedProvince.rate;

  const dailyKwh = round((bill / rate) / 30);
  const peakLoad = dailyKwh / 8 / 0.6;
  const requiredKwp = Math.max(1, round((dailyKwh / (4.5 * 0.8)) * 10) / 10);
  const panelCount = Math.ceil((requiredKwp * 1000) / 415);
  const batteryCount = Math.ceil((dailyKwh * 0.4 * (backupOption.hours / 24)) / 9.6 / 0.95);
  const totalStorage = round(batteryCount * 9.6);
  const backupHours = batteryCount > 0 ? round((batteryCount * 9.6 * 0.95) / (dailyKwh / 24 * 0.4)) : 0;
  const annualGen = round(requiredKwp * 4.5 * 365 * 0.8);
  const annualSavings = round(annualGen * rate);
  const monthlySavings = round(annualSavings / 12);
  const systemCost = round(requiredKwp * 85000);
  const paybackYears = systemCost > 0 && annualSavings > 0 ? Math.round((systemCost / annualSavings) * 10) / 10 : 0;
  const co2Offset = round(annualGen * 0.5281 / 1000);

  const inverterIndex = peakLoad > 6.0 ? 3 : peakLoad > 5.0 ? 2 : peakLoad > 3.68 ? 1 : 0;
  const selectedInverter = NEOVOLT_INVERTERS_SINGLE[inverterIndex] as typeof NEOVOLT_INVERTERS_SINGLE[number];

  const chartData = Array.from({ length: 10 }, (_, i) => ({
    year: `Yr ${i + 1}`,
    savings: round(annualSavings * (i + 1)),
  }));

  const handleCalculate = () => {
    setLoading(true);
    setShowResults(false);
    setTimeout(() => {
      setLoading(false);
      setShowResults(true);
    }, 1000);
  };

  return (
    <section id="calculator" className="py-24 relative">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
            {t('title')}
          </h2>
          <p className="text-gray-400">{t('subtitle')}</p>
        </div>

        <div className="glass-panel rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {t('monthlyBill')}
                </label>
                <div className="flex items-center justify-between text-2xl font-bold text-white mb-2">
                  <span>₱500</span>
                  <span className="text-accent-blue">₱{bill.toLocaleString()}</span>
                  <span>₱50,000</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={bill}
                  onChange={(e) => setBill(Number(e.target.value))}
                  className="w-full h-2 bg-surface-800 rounded-lg appearance-none cursor-pointer accent-accent-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {t('province')}
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-800 border border-border-subtle text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                >
                  {PROVINCES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₱{p.rate}/kWh
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {t('propertyType')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['residential', 'commercial'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPropertyType(type)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                        propertyType === type
                          ? 'bg-accent-blue text-white border-accent-blue'
                          : 'bg-surface-800 text-white/60 border-border-subtle hover:border-white/20'
                      }`}
                    >
                      {t(type)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {t('backupHours')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {BACKUP_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBackupId(opt.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                        backupId === opt.id
                          ? 'bg-accent-blue text-white border-accent-blue'
                          : 'bg-surface-800 text-white/60 border-border-subtle hover:border-white/20'
                      }`}
                    >
                      {t(opt.label)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCalculate}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-accent-blue text-white font-semibold hover:bg-accent-blue/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Spinner className="w-5 h-5" /> {t('calculating')}</>
            ) : (
              t('calculate')
            )}
          </button>

          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-12"
              >
                <div className="flex flex-col items-center gap-3">
                  <Spinner className="w-8 h-8" />
                  <p className="text-sm text-gray-400">{t('calculating')}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8 space-y-6"
              >
                <h3 className="text-xl font-display font-bold text-white text-center">
                  {t('results')}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: t('dailyConsumption'), value: `${dailyKwh} kWh`, color: 'text-accent-blue' },
                    { label: t('recommendedInverter'), value: selectedInverter.sku, color: 'text-accent-cyan' },
                    { label: t('pvArray'), value: `${requiredKwp} kWp (${panelCount} panels)`, color: 'text-accent-emerald' },
                    { label: t('recommendedBattery'), value: `${batteryCount}× BW-BAT-10.1P (${totalStorage} kWh)`, color: 'text-accent-cyan' },
                    { label: t('backupAutonomy'), value: `~${backupHours} hours`, color: 'text-accent-blue' },
                    { label: t('monthlySavings'), value: `₱${monthlySavings.toLocaleString()}`, color: 'text-accent-emerald' },
                    { label: t('annualSavings'), value: `₱${annualSavings.toLocaleString()}`, color: 'text-accent-emerald' },
                    { label: t('paybackPeriod'), value: `~${paybackYears} years`, color: 'text-accent-cyan' },
                    { label: t('co2Offset'), value: `${co2Offset} tonnes/yr`, color: 'text-accent-blue' },
                  ].map((item) => (
                    <div key={item.label} className="bento-card p-4 text-center">
                      <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                      <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bento-card p-6">
                  <h4 className="text-sm font-semibold text-white mb-4 text-center">
                    {t('tenYearChart')}
                  </h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="year" tick={{ fill: '#B0B8C8', fontSize: 11 }} />
                        <YAxis tick={{ fill: '#B0B8C8', fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            background: '#0F1F36',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '12px',
                            color: '#fff',
                          }}
                        />
                        <Bar dataKey="savings" fill="#2563EB" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <p className="text-xs text-gray-500 text-center">{t('disclaimer')}</p>

                <Link
                  href={`/contact?bill=${bill}&province=${province}&type=${propertyType}`}
                  className="block w-full py-3 text-center bg-accent-blue text-white font-semibold rounded-xl hover:bg-accent-blue/90 transition-colors"
                >
                  {t('cta')}
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
