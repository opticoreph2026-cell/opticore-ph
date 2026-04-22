'use client';

import { useState, useEffect } from 'react';
import { Zap, Droplets, TrendingDown, Calculator } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';

/**
 * Interactive utility cost calculator on the landing page.
 * Fetches providers from /api/dashboard/providers (server-side Airtable call).
 */
export default function LandingCalculator() {
  const [electricProviders, setElectricProviders] = useState([]);
  const [waterProviders,    setWaterProviders]    = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [form,              setForm]              = useState({
    electricProvider: '',
    waterProvider:   '',
    kwhUsed:         350,
    m3Used:          15,
  });
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function fetchProviders() {
      try {
        const [eRes, wRes] = await Promise.all([
          fetch('/api/dashboard/providers?type=electricity'),
          fetch('/api/dashboard/providers?type=water'),
        ]);
        const [eData, wData] = await Promise.all([eRes.json(), wRes.json()]);
        setElectricProviders(eData.providers ?? []);
        setWaterProviders(wData.providers ?? []);
      } catch {
        // Non-critical: calculator still works with manual estimate
      } finally {
        setLoading(false);
      }
    }
    fetchProviders();
  }, []);

  // Estimate bill from selected provider rates or fallback averages
  const calculate = () => {
    const ep = electricProviders.find(p => p.id === form.electricProvider);
    const wp = waterProviders.find(p => p.id === form.waterProvider);

    const eRate = ep?.baseRate ?? 11.8;   // ₱/kWh fallback (Philippine avg)
    const wRate = wp?.baseRate ?? 28.5;   // ₱/m³ fallback

    const electricBill = form.kwhUsed * eRate;
    const waterBill    = form.m3Used  * wRate;
    const total        = electricBill + waterBill;

    // Rough AI-style savings estimate (15–25% reduction)
    const savingsPct = 0.20;
    const savings    = total * savingsPct;

    setResult({
      electricBill: electricBill.toFixed(0),
      waterBill:    waterBill.toFixed(0),
      total:        total.toFixed(0),
      savings:      savings.toFixed(0),
      eRate:        eRate.toFixed(2),
      wRate:        wRate.toFixed(2),
      eProviderName: ep?.name ?? 'Average rate',
      wProviderName: wp?.name ?? 'Average rate',
    });
  };

  return (
    <div className="card max-w-2xl mx-auto border-brand-500/15">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">Savings Estimator</h3>
          <p className="text-xs text-text-muted">Select your providers for accurate rates</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <div className="space-y-5">
          {/* Provider selects */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-muted mb-1.5 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-brand-400" /> Electricity Provider
              </label>
              <select
                className="input-field"
                value={form.electricProvider}
                onChange={e => setForm(p => ({ ...p, electricProvider: e.target.value }))}
              >
                <option value="">— Select provider —</option>
                {electricProviders.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.region ? `(${p.region})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1.5 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-blue-400" /> Water Provider
              </label>
              <select
                className="input-field"
                value={form.waterProvider}
                onChange={e => setForm(p => ({ ...p, waterProvider: e.target.value }))}
              >
                <option value="">— Select provider —</option>
                {waterProviders.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.region ? `(${p.region})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Usage inputs */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-muted mb-1.5">Monthly kWh Used</label>
              <div className="relative">
                <input
                  type="number" min="0" max="9999"
                  className="input-field pr-12"
                  value={form.kwhUsed}
                  onChange={e => setForm(p => ({ ...p, kwhUsed: +e.target.value }))}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-text-muted">kWh</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1.5">Monthly m³ Used</label>
              <div className="relative">
                <input
                  type="number" min="0" max="999"
                  className="input-field pr-10"
                  value={form.m3Used}
                  onChange={e => setForm(p => ({ ...p, m3Used: +e.target.value }))}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-text-muted">m³</span>
              </div>
            </div>
          </div>

          {/* Calculate button */}
          <button onClick={calculate} className="btn-primary w-full">
            <Calculator className="w-4 h-4" /> Calculate My Savings
          </button>

          {/* Result */}
          {result && (
            <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-5 space-y-4 animate-fade-up">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-[10px] text-text-muted mb-1">Electric Bill</p>
                  <p className="text-lg font-semibold text-text-primary">₱{Number(result.electricBill).toLocaleString()}</p>
                  <p className="text-[10px] text-text-muted">@ ₱{result.eRate}/kWh</p>
                </div>
                <div>
                  <p className="text-[10px] text-text-muted mb-1">Water Bill</p>
                  <p className="text-lg font-semibold text-text-primary">₱{Number(result.waterBill).toLocaleString()}</p>
                  <p className="text-[10px] text-text-muted">@ ₱{result.wRate}/m³</p>
                </div>
                <div>
                  <p className="text-[10px] text-text-muted mb-1">Total</p>
                  <p className="text-lg font-semibold text-brand-400">₱{Number(result.total).toLocaleString()}</p>
                </div>
              </div>

              <div className="border-t border-brand-500/15 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-text-secondary">
                    AI-optimized potential savings
                  </span>
                </div>
                <span className="text-lg font-bold text-emerald-400">
                  ₱{Number(result.savings).toLocaleString()}/mo
                </span>
              </div>
              <p className="text-[10px] text-text-muted text-center">
                Estimate based on {result.eProviderName} + {result.wProviderName} rates.
                Actual savings depend on AI analysis of your full billing history.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
