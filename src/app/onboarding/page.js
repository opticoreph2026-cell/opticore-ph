'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight, Zap, Target, Cpu, ChevronRight, AlertCircle } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saveError, setSaveError] = useState('');
  
  const [electricProviders, setElectricProviders] = useState([]);
  const [waterProviders, setWaterProviders] = useState([]);
  
  const [form, setForm] = useState({
    electricProvider: '',
    waterProvider: '',
  });

  useEffect(() => {
    async function fetchProviders() {
      try {
        const [eRes, wRes] = await Promise.all([
          fetch('/api/dashboard/providers?type=electricity'),
          fetch('/api/dashboard/providers?type=water'),
        ]);
        const eData = await eRes.json();
        const wData = await wRes.json();
        setElectricProviders(eData.providers ?? []);
        setWaterProviders(wData.providers ?? []);
      } catch {
        // Silently fail — user can still proceed without provider lists
      } finally {
        setFetching(false);
      }
    }
    fetchProviders();
  }, []);

  const handleNext = async () => {
    if (step === 1) {
      setSaveError('');
      setLoading(true);
      try {
        const res = await fetch('/api/dashboard/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            section: 'settings', 
            electricProvider: form.electricProvider, 
            waterProvider: form.waterProvider 
          })
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setSaveError(data.error || 'Failed to save utility providers. Please try again.');
          setLoading(false);
          return;
        }
      } catch {
        setSaveError('Network error while saving providers. Please try again.');
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
      setStep(2);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setSaveError('');
    try {
      const res = await fetch('/api/dashboard/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'onboarding-complete' })
      });
      if (!res.ok) {
        setSaveError('Could not finalize setup. Please try again.');
        setLoading(false);
        return;
      }
      setLoading(false);
      // Use replace to prevent back-button loop to onboarding
      router.replace('/dashboard');
    } catch {
      setSaveError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const STEPS = [
    { num: 1, label: 'Providers' },
    { num: 2, label: 'Ready' },
  ];

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col justify-center py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-radial pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-500/4 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />

      <div className="max-w-lg w-full mx-auto animate-fade-up relative z-10">

        {/* OptiCore logo */}
        <div className="flex items-center gap-2.5 justify-center mb-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.05) 100%)',
            border: '1px solid rgba(245,158,11,0.3)',
            boxShadow: '0 0 20px rgba(245,158,11,0.15)',
          }}>
            <Zap className="w-4.5 h-4.5 text-brand-400" />
          </div>
          <span className="shimmer-text font-bold text-lg tracking-tight">OptiCore PH</span>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {STEPS.map((s, idx) => (
            <div key={s.num} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                    step >= s.num
                      ? 'text-surface-950'
                      : 'text-text-faint'
                  }`}
                  style={step >= s.num ? {
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    boxShadow: '0 0 12px rgba(245,158,11,0.4)',
                  } : {
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {step > s.num ? '✓' : s.num}
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${step >= s.num ? 'text-brand-400' : 'text-text-faint'}`}>
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`w-12 h-px transition-colors duration-500 ${step > s.num ? 'bg-brand-500' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Main card */}
        <div className="bento-card p-8" style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)' }}>

          {/* Error banner */}
          {saveError && (
            <div className="flex items-center gap-2.5 p-3 mb-5 rounded-xl animate-fade-up"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-xs text-red-300">{saveError}</p>
            </div>
          )}

          {/* Step 1: Providers */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0.05) 100%)',
                  border: '1px solid rgba(245,158,11,0.28)',
                }}>
                  <Target className="w-7 h-7 text-brand-400" />
                </div>
                <p className="text-[10px] font-black text-brand-500/70 uppercase tracking-[0.2em] mb-2">Step 1 of 2</p>
                <h2 className="text-2xl font-bold text-text-primary mb-2">Set Your Utility Providers</h2>
                <p className="text-sm text-text-muted leading-relaxed max-w-sm mx-auto">
                  OptiCore AI uses your providers to calibrate accurate tariff rates and benchmark your consumption.
                </p>
              </div>

              {fetching ? (
                <div className="py-10 flex justify-center">
                  <Spinner />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.18em] mb-2">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3 h-3 text-brand-500" /> Electricity Provider
                      </span>
                    </label>
                    <select
                      className="input-field"
                      value={form.electricProvider}
                      onChange={(e) => setForm({ ...form, electricProvider: e.target.value })}
                    >
                      <option value="">— Skip for now —</option>
                      {electricProviders.map(p => (
                        <option key={p.id} value={p.id}>{p.name} {p.region ? `(${p.region})` : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.18em] mb-2">
                      <span className="flex items-center gap-1.5">
                        <span>💧</span> Water Provider
                      </span>
                    </label>
                    <select
                      className="input-field"
                      value={form.waterProvider}
                      onChange={(e) => setForm({ ...form, waterProvider: e.target.value })}
                    >
                      <option value="">— Skip for now —</option>
                      {waterProviders.map(p => (
                        <option key={p.id} value={p.id}>{p.name} {p.region ? `(${p.region})` : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <button
                onClick={handleNext}
                disabled={loading || fetching}
                className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
              >
                {loading ? <Spinner size="sm" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
              </button>

              <p className="text-center text-xs text-text-faint mt-2">
                You can change providers anytime in Settings.
              </p>
            </div>
          )}

          {/* Step 2: All Set */}
          {step === 2 && (
            <div className="space-y-6 text-center animate-scale-in">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto relative" style={{
                background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(16,185,129,0.05) 100%)',
                border: '1px solid rgba(16,185,129,0.28)',
              }}>
                <CheckCircle className="w-10 h-10 text-emerald-400" />
                <div className="absolute -inset-2 rounded-full border border-emerald-500/10 animate-pulse-slow" />
              </div>

              <div>
                <p className="text-[10px] font-black text-emerald-500/70 uppercase tracking-[0.2em] mb-2">Setup Complete</p>
                <h2 className="text-2xl font-bold text-text-primary mb-2">You&apos;re All Set!</h2>
                <p className="text-sm text-text-muted max-w-sm mx-auto leading-relaxed">
                  Your account is ready. To get the most accurate AI recommendations, add your appliances once you&apos;re in the dashboard.
                </p>
              </div>

              <div className="p-4 rounded-xl text-left" style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-faint flex items-center gap-2 mb-3">
                  <Cpu className="w-3.5 h-3.5" /> Recommended Next Steps
                </h4>
                <ul className="space-y-2.5">
                  {[
                    'Go to My Appliances to build your home profile.',
                    'Enter your first monthly reading to generate an AI report.',
                    'Follow the AI\'s custom savings plan.',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-text-secondary">
                      <ChevronRight className="w-3.5 h-3.5 text-brand-500/60 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleComplete}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? <Spinner size="sm" /> : <>Go to Dashboard <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
