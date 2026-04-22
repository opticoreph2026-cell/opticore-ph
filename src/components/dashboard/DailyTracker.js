'use client';

import { useState, useEffect } from 'react';
import { Activity, Plus, History, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import Toast from '@/components/ui/Toast';

export default function DailyTracker() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [meterValue, setMeterValue] = useState('');
  const [toast, setToast] = useState({ msg: null, type: 'info' });
  const [activeAlert, setActiveAlert] = useState(null);

  useEffect(() => {
    fetchReadings();
  }, []);

  const fetchReadings = async () => {
    try {
      const res = await fetch('/api/dashboard/daily-readings');
      const data = await res.json();
      if (data.success) {
        setReadings(data.readings || []);
      }
    } catch (err) {
      console.error('Failed to fetch daily readings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!meterValue) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/dashboard/daily-readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meterValue,
          date: new Date().toISOString().split('T')[0]
        })
      });

      const data = await res.json();
      if (data.success) {
        setReadings([data.reading, ...readings]);
        setMeterValue('');
        if (data.alertDetails) {
          setActiveAlert(data.alertDetails);
        } else {
          setActiveAlert(null);
          setToast({ msg: 'Meter reading registered!', type: 'success' });
        }
      } else {
        setToast({ msg: data.error || 'Failed to save reading', type: 'error' });
      }
    } catch (err) {
      setToast({ msg: 'Network error', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const lastReading = readings[0];
  const previousReading = readings[1];

  if (loading) return (
    <div className="card h-full flex items-center justify-center py-12">
      <Spinner />
    </div>
  );

  return (
    <div className="card h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-text-primary flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-400" /> Daily Micro-Tracker
        </h2>
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-2 py-0.5 rounded-md bg-surface-900 border border-white/5">
          Beta
        </span>
      </div>

      <div className="flex-1 space-y-6">
        {/* Input Area */}
        <form onSubmit={handleSubmit} className="relative">
          <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1 mb-2">
            Input Current Meter (kWh)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              value={meterValue}
              onChange={(e) => setMeterValue(e.target.value)}
              placeholder="e.g. 14502.5"
              className="flex-1 bg-surface-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-brand-500/50 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={submitting || !meterValue}
              className="px-4 py-2.5 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-surface-950 rounded-xl transition-all shadow-lg shadow-brand-500/10"
            >
              {submitting ? <Spinner size="sm" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>
        </form>

        {/* Status Display */}
        {activeAlert && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3 animate-fade-down shadow-lg">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="leading-relaxed font-medium">{activeAlert}</p>
          </div>
        )}
        
        {lastReading ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface-900 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Yesterday's Delta</p>
                <p className="text-xl font-bold text-text-primary">
                  {lastReading.kwhDelta !== null ? (
                    <span className="flex items-baseline gap-1">
                      {lastReading.kwhDelta.toFixed(1)} <span className="text-xs text-text-muted font-medium">kWh</span>
                    </span>
                  ) : (
                    <span className="text-sm text-text-muted italic">Awaiting Next Day...</span>
                  )}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${lastReading.kwhDelta > 15 ? 'bg-orange-500/10' : 'bg-emerald-500/10'}`}>
                 <TrendingUp className={`w-5 h-5 ${lastReading.kwhDelta > 15 ? 'text-orange-400' : 'text-emerald-400'}`} />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1">Recent History</p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 thin-scrollbar">
                {readings.slice(0, 5).map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 bg-white/[0.02] rounded-lg border border-white/[0.03]">
                    <span className="text-xs text-text-secondary">{r.date}</span>
                    <span className="text-xs font-mono font-bold text-text-primary">
                      {r.kwhDelta !== null ? `+${r.kwhDelta.toFixed(1)} kWh` : `${r.meterValue} total`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-center opacity-50">
            <History className="w-8 h-8 text-text-muted mb-3" />
            <p className="text-xs text-text-muted max-w-[180px]">No daily logs yet. Start by logging your current meter value.</p>
          </div>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-white/[0.04] flex items-center gap-2 text-[10px] text-text-muted italic">
        <AlertCircle className="w-3 h-3" />
        Manual physical meter sync recommended daily at 9 PM.
      </div>
      <Toast message={toast.msg} type={toast.type} onClose={() => setToast({ msg: null, type: 'info' })} />
    </div>
  );
}
