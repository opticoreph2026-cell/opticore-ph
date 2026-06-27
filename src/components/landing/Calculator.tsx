'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Spinner } from '@/components/ui/Spinner';
import { NEOVOLT_INVERTERS_SINGLE } from '@/data/neovolt-products';

interface UtilityOption {
  id: string;
  code: string;
  name: string;
  rateRu?: number;
}

const BACKUP_OPTIONS = [
  { id: '4', label: 'hours4', hours: 4 },
  { id: '8', label: 'hours8', hours: 8 },
  { id: '12', label: 'hours12', hours: 12 },
  { id: '24', label: 'hours24', hours: 24 },
] as const;

function round(v: number): number {
  return Math.round(v);
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function Calculator() {
  const t = useTranslations('calculator');
  const [bill, setBill] = useState(5000);
  const [propertyType, setPropertyType] = useState('residential');
  const [backupId, setBackupId] = useState('8');
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  const [utilities, setUtilities] = useState<UtilityOption[]>([]);
  const [utilitySearch, setUtilitySearch] = useState('');
  const [utilitySuggestions, setUtilitySuggestions] = useState<UtilityOption[]>([]);
  const [selectedUtility, setSelectedUtility] = useState<UtilityOption | null>(null);
  const [utilityLoading, setUtilityLoading] = useState(false);
  const [showUtilitySuggestions, setShowUtilitySuggestions] = useState(false);
  const debouncedSearch = useDebounce(utilitySearch, 300);

  const [manualRate, setManualRate] = useState('');

  useEffect(() => {
    fetch('/api/energy/utility-rates')
      .then((r) => r.json())
      .then((res) => {
        if (res.data?.companies) {
          const opts: UtilityOption[] = res.data.companies.map((c: any) => ({
            id: c.id,
            code: c.code,
            name: c.name,
            rateRu: c.latestRate ? c.latestRate.allInRateRu : undefined,
          }));
          setUtilities(opts);
          setUtilitySuggestions(opts);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!debouncedSearch) {
      setUtilitySuggestions(utilities);
      return;
    }
    const q = debouncedSearch.toLowerCase();
    setUtilitySuggestions(
      utilities.filter((u) => u.code.toLowerCase().includes(q) || u.name.toLowerCase().includes(q))
    );
  }, [debouncedSearch, utilities]);

  const rate = selectedUtility?.rateRu ? selectedUtility.rateRu / 10000 : parseFloat(manualRate) || 0;

  const backupOption = BACKUP_OPTIONS.find((b) => b.id === backupId)!;

  const dailyKwh = rate > 0 ? round((bill / rate) / 30) : 0;
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

  const activeBtn = (isActive: boolean) =>
    isActive
      ? 'bg-primary-500 text-background-50 border-primary-500'
      : 'bg-background-100/40 text-foreground-600 border-foreground-950/10 hover:border-foreground-950/20';

  return (
    <section id="calculator" className="py-24 relative">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground-950 mb-4">
            {t('title')}
          </h2>
          <p className="text-foreground-600">{t('subtitle')}</p>
        </div>

        <div className="glass-panel rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground-600 mb-2">
                  {t('monthlyBill')}
                </label>
                <div className="flex items-center justify-between text-2xl font-bold text-foreground-950 mb-2">
                  <span className="text-foreground-500">₱500</span>
                  <span className="text-primary-500">₱{bill.toLocaleString()}</span>
                  <span className="text-foreground-500">₱50,000</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={bill}
                  onChange={(e) => setBill(Number(e.target.value))}
                  className="w-full h-2 bg-foreground-950/10 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-foreground-600 mb-2">
                  {t('electricUtility')}
                </label>
                <input
                  type="text"
                  value={selectedUtility ? `${selectedUtility.name} (${selectedUtility.code})` : utilitySearch}
                  onChange={(e) => { setUtilitySearch(e.target.value); setSelectedUtility(null); setShowUtilitySuggestions(true); }}
                  onFocus={() => setShowUtilitySuggestions(true)}
                  placeholder="Search electric company..."
                  className="w-full px-4 py-2.5 rounded-xl bg-background-100/40 border border-foreground-950/10 text-foreground-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {utilityLoading && (
                  <div className="absolute right-3 top-9"><Spinner className="w-4 h-4" /></div>
                )}
                {showUtilitySuggestions && utilitySuggestions.length > 0 && !selectedUtility && (
                  <div className="absolute z-20 mt-1 w-full bg-background-50 border border-foreground-950/10 rounded-xl max-h-48 overflow-y-auto shadow-xl">
                    {utilitySuggestions.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => { setSelectedUtility(u); setUtilitySearch(''); setShowUtilitySuggestions(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-foreground-600 hover:bg-foreground-950/5 hover:text-foreground-950 transition-colors"
                      >
                        <span className="font-medium">{u.name}</span>
                        <span className="text-foreground-400 ml-2">({u.code})</span>
                        {u.rateRu && (
                          <span className="text-accent-500 ml-2">₱{(u.rateRu / 10000).toFixed(4)}/kWh</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {!selectedUtility && (
                  <div className="mt-2">
                    <label className="block text-xs text-foreground-500 mb-1">Or enter rate manually (₱/kWh)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={manualRate}
                      onChange={(e) => setManualRate(e.target.value)}
                      placeholder="e.g. 12.88"
                      className="w-full px-3 py-1.5 rounded-lg bg-background-100/40 border border-foreground-950/10 text-foreground-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground-600 mb-2">
                  {t('propertyType')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['residential', 'commercial'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPropertyType(type)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${activeBtn(propertyType === type)}`}
                    >
                      {t(type)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-600 mb-2">
                  {t('backupHours')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {BACKUP_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBackupId(opt.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${activeBtn(backupId === opt.id)}`}
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
            className="w-full py-3 rounded-xl bg-primary-500 text-background-50 font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
                  <p className="text-sm text-foreground-600">{t('calculating')}</p>
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
                <h3 className="text-xl font-display font-bold text-foreground-950 text-center">
                  {t('results')}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: t('dailyConsumption'), value: `${dailyKwh} kWh`, color: 'text-primary-500' },
                    { label: t('recommendedInverter'), value: selectedInverter.sku, color: 'text-accent-500' },
                    { label: t('pvArray'), value: `${requiredKwp} kWp (${panelCount} panels)`, color: 'text-secondary-500' },
                    { label: t('recommendedBattery'), value: `${batteryCount}× BW-BAT-10.1P (${totalStorage} kWh)`, color: 'text-accent-500' },
                    { label: t('backupAutonomy'), value: `~${backupHours} hours`, color: 'text-primary-500' },
                    { label: t('monthlySavings'), value: `₱${monthlySavings.toLocaleString()}`, color: 'text-secondary-500' },
                    { label: t('annualSavings'), value: `₱${annualSavings.toLocaleString()}`, color: 'text-secondary-500' },
                    { label: t('paybackPeriod'), value: `~${paybackYears} years`, color: 'text-accent-500' },
                    { label: t('co2Offset'), value: `${co2Offset} tonnes/yr`, color: 'text-primary-500' },
                  ].map((item) => (
                    <div key={item.label} className="bento-card p-4 text-center">
                      <p className="text-xs text-foreground-600 mb-1">{item.label}</p>
                      <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bento-card p-6">
                  <h4 className="text-sm font-semibold text-foreground-950 mb-4 text-center">
                    {t('tenYearChart')}
                  </h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                        <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11 }} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            background: 'color-mix(in oklch, var(--color-background-50), transparent 10%)',
                            border: '1px solid oklch(var(--color-foreground-950) / 0.1)',
                            borderRadius: '12px',
                            color: 'oklch(var(--color-foreground-950))',
                          }}
                        />
                        <Bar dataKey="savings" fill="#2563EB" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <p className="text-xs text-foreground-500 text-center">{t('disclaimer')}</p>

                <Link
                  href={`/contact?bill=${bill}&province=${selectedUtility?.code || ''}&type=${propertyType}`}
                  className="block w-full py-3 text-center bg-primary-500 text-background-50 font-semibold rounded-xl hover:bg-primary-600 transition-colors"
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
