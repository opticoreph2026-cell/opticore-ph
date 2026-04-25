'use client';

import { useState, useEffect } from 'react';
import {
  Calculator, Zap, ArrowRight, TrendingDown, Clock, Wallet,
  BarChart3, Sparkles, ChevronDown, RefreshCcw, CircleAlert
} from 'lucide-react';
import Spinner from '@/components/ui/Spinner';

const PRESET_ICONS = {
  ac_standard_to_inverter: '❄️',
  ref_standard_to_inverter: '🧊',
  incandescent_to_led: '💡',
  washer_standard_to_inverter: '🫧',
  electric_fan_to_dc: '🌀',
  water_heater_to_solar: '☀️',
};

export default function ROISimulator({ effectiveRate = 0 }) {
  const [presets, setPresets] = useState({});
  const [selectedPreset, setSelectedPreset] = useState('');
  const [form, setForm] = useState({
    currentWattage: '',
    proposedWattage: '',
    hoursPerDay: '',
    quantity: 1,
    upgradeCost: '',
    applianceName: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showProjections, setShowProjections] = useState(false);

  // Load presets on mount
  useEffect(() => {
    fetch('/api/ai/roi-simulator')
      .then(r => r.json())
      .then(d => setPresets(d.presets || {}))
      .catch(() => {});
  }, []);

  const handlePresetChange = (key) => {
    setSelectedPreset(key);
    setResult(null);
    setError('');
    if (!key) return;

    const p = presets[key];
    if (p) {
      setForm({
        currentWattage: p.currentWattage,
        proposedWattage: p.proposedWattage,
        hoursPerDay: p.hoursPerDay,
        quantity: 1,
        upgradeCost: p.estimatedCost,
        applianceName: p.label,
      });
    }
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/ai/roi-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          effectiveRate: effectiveRate || 11.5,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Calculation failed.');
      } else {
        setResult(data.analysis);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({
      currentWattage: '', proposedWattage: '', hoursPerDay: '',
      quantity: 1, upgradeCost: '', applianceName: '',
    });
    setSelectedPreset('');
    setResult(null);
    setError('');
    setShowProjections(false);
  };

  const inputClass = 'w-full bg-surface-900 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-text-primary focus:border-brand-500/50 outline-none transition-colors';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Calculator className="w-5 h-5 text-brand-400" />
            Hardware ROI Simulator
          </h2>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            Calculate the payback period for energy-efficient upgrades using your actual bill rate.
          </p>
        </div>
        {result && (
          <button onClick={handleReset} className="btn-ghost text-xs flex items-center gap-1.5">
            <RefreshCcw className="w-3.5 h-3.5" /> Reset
          </button>
        )}
      </div>

      {/* Effective Rate Context */}
      {effectiveRate > 0 && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-brand-500/[0.06] border border-brand-500/15 rounded-xl">
          <Zap className="w-4 h-4 text-brand-400 shrink-0" />
          <p className="text-xs text-text-secondary">
            Using your effective rate: <strong className="text-brand-400 font-mono">₱{effectiveRate.toFixed(2)}/kWh</strong> from latest bill
          </p>
        </div>
      )}

      {!result ? (
        <form onSubmit={handleCalculate} className="space-y-5">
          {error && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
              <CircleAlert className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Preset Selector */}
          <div className="card bg-surface-900/50 border-white/[0.04]">
            <label className="block text-[10px] uppercase font-bold text-text-muted tracking-wider mb-3">
              Quick Presets (Philippine Market)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(presets).map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handlePresetChange(key)}
                  className={`text-left p-3 rounded-xl border text-xs transition-all ${
                    selectedPreset === key
                      ? 'border-brand-500/30 bg-brand-500/10 text-brand-400'
                      : 'border-white/[0.06] hover:border-white/[0.12] text-text-muted hover:text-text-primary'
                  }`}
                >
                  <div className="text-lg mb-1">{PRESET_ICONS[key] || '🔌'}</div>
                  <div className="font-semibold truncate">{preset.label?.split('→')[0]?.trim()}</div>
                  <div className="opacity-60 mt-0.5">→ {preset.label?.split('→')[1]?.trim()}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Inputs */}
          <div className="card bg-surface-900/50 border-white/[0.04]">
            <label className="block text-[10px] uppercase font-bold text-text-muted tracking-wider mb-4">
              Upgrade Parameters
            </label>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-text-secondary mb-1.5">Current Wattage (W)</label>
                <input
                  type="number" min="1" required
                  className={inputClass}
                  placeholder="e.g. 1500"
                  value={form.currentWattage}
                  onChange={e => setForm({...form, currentWattage: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1.5">Proposed Wattage (W)</label>
                <input
                  type="number" min="1" required
                  className={inputClass}
                  placeholder="e.g. 900"
                  value={form.proposedWattage}
                  onChange={e => setForm({...form, proposedWattage: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1.5">Daily Usage (hrs)</label>
                <input
                  type="number" min="0.5" max="24" step="0.5" required
                  className={inputClass}
                  placeholder="e.g. 8"
                  value={form.hoursPerDay}
                  onChange={e => setForm({...form, hoursPerDay: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1.5">Quantity (Units)</label>
                <input
                  type="number" min="1" required
                  className={inputClass}
                  placeholder="1"
                  value={form.quantity}
                  onChange={e => setForm({...form, quantity: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1.5">Upgrade Cost (₱)</label>
                <input
                  type="number" min="1" required
                  className={inputClass}
                  placeholder="e.g. 32000"
                  value={form.upgradeCost}
                  onChange={e => setForm({...form, upgradeCost: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1.5">Label (Optional)</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Bedroom AC"
                  value={form.applianceName}
                  onChange={e => setForm({...form, applianceName: e.target.value})}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/15"
          >
            {loading ? <Spinner size="sm" /> : (
              <>
                <Sparkles className="w-4 h-4" /> Calculate ROI
              </>
            )}
          </button>
        </form>
      ) : (
        /* ── Results Dashboard ─────────────────────────────────────────── */
        <div className="space-y-5 animate-fade-up">
          {/* Hero KPI */}
          <div className="card bg-gradient-to-br from-brand-500/10 to-emerald-500/5 border-brand-500/20 text-center py-8">
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-brand-400 mb-2">Break-Even Payback Period</p>
            {result.paybackMonths ? (
              <>
                <h2 className="text-5xl font-black text-text-primary tracking-tight">
                  {result.paybackMonths}
                  <span className="text-lg font-medium text-text-muted ml-1">months</span>
                </h2>
                <p className="text-xs text-text-muted mt-2">
                  ≈ {result.paybackYears} years · After that, pure savings
                </p>
              </>
            ) : (
              <h2 className="text-2xl font-bold text-red-400">Not viable — upgrade costs more than savings</h2>
            )}
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPICard
              icon={<TrendingDown className="w-3.5 h-3.5 text-emerald-400" />}
              label="Monthly Savings"
              value={`₱${result.savingsPerMonth.toLocaleString()}`}
              sub={`${result.savingsKwhPerMonth} kWh saved`}
            />
            <KPICard
              icon={<Wallet className="w-3.5 h-3.5 text-brand-400" />}
              label="Annual Savings"
              value={`₱${result.annualSavings.toLocaleString()}`}
              sub={`${result.annualKwhSaved} kWh/year`}
            />
            <KPICard
              icon={<Zap className="w-3.5 h-3.5 text-amber-400" />}
              label="Efficiency Gain"
              value={`${result.efficiencyGain}%`}
              sub={`${result.currentMonthlyKwh} → ${result.proposedMonthlyKwh} kWh/mo`}
            />
            <KPICard
              icon={<Clock className="w-3.5 h-3.5 text-blue-400" />}
              label="Rate Used"
              value={`₱${result.effectiveRateUsed.toFixed(2)}`}
              sub="per kWh"
            />
          </div>

          {/* Projections */}
          <div className="card bg-surface-900/50 border-white/[0.04]">
            <button
              onClick={() => setShowProjections(!showProjections)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-400" />
                <span className="text-sm font-bold text-text-primary">Multi-Year Projections</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${showProjections ? 'rotate-180' : ''}`} />
            </button>

            {showProjections && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="py-2.5 px-3 text-left font-bold text-text-muted uppercase tracking-wider">Year</th>
                      <th className="py-2.5 px-3 text-right font-bold text-text-muted uppercase tracking-wider">Total Saved</th>
                      <th className="py-2.5 px-3 text-right font-bold text-text-muted uppercase tracking-wider">Net Return</th>
                      <th className="py-2.5 px-3 text-right font-bold text-text-muted uppercase tracking-wider">ROI</th>
                      <th className="py-2.5 px-3 text-right font-bold text-text-muted uppercase tracking-wider">kWh Saved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.projections.map((p) => (
                      <tr key={p.years} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                        <td className="py-2.5 px-3 font-semibold text-text-primary">Year {p.years}</td>
                        <td className="py-2.5 px-3 text-right text-emerald-400 font-mono">₱{p.totalSaved.toLocaleString()}</td>
                        <td className={`py-2.5 px-3 text-right font-mono ${p.netReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {p.netReturn >= 0 ? '+' : ''}₱{p.netReturn.toLocaleString()}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-bold ${p.roi >= 0 ? 'text-brand-400' : 'text-red-400'}`}>
                          {p.roi}%
                        </td>
                        <td className="py-2.5 px-3 text-right text-text-muted font-mono">{p.kwhSaved.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Preset notes */}
          {selectedPreset && presets[selectedPreset]?.notes && (
            <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
              <Sparkles className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-300 leading-relaxed">{presets[selectedPreset].notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KPICard({ icon, label, value, sub }) {
  return (
    <div className="card bg-surface-900/70 border-white/[0.04] p-4">
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-[9px] uppercase font-bold tracking-wider text-text-muted">{label}</span>
      </div>
      <p className="text-lg font-bold text-text-primary font-mono tracking-tight">{value}</p>
      {sub && <p className="text-[10px] text-text-muted mt-0.5">{sub}</p>}
    </div>
  );
}
