'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Brain, ShieldAlert, Sparkles } from 'lucide-react';

export default function ForecastWidget({ plan }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isPremium = plan === 'pro' || plan === 'business';

  useEffect(() => {
    if (!isPremium) {
      setLoading(false);
      return;
    }

    async function fetchForecast() {
      try {
        const res = await fetch('/api/dashboard/forecast');
        if (!res.ok) {
          if (res.status === 403) setError('UPGRADE');
          else throw new Error('Failed to fetch forecast');
        } else {
          const json = await res.json();
          setData(json.data);
        }
      } catch (err) {
        setError('ERROR');
      } finally {
        setLoading(false);
      }
    }

    fetchForecast();
  }, [isPremium]);

  if (!isPremium) {
    return (
      <div className="card h-full flex flex-col items-center justify-center text-center p-6 bg-surface-800/40 relative overflow-hidden group">
        <div className="absolute inset-0 bg-surface-900/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={() => window.location.href='/pricing'} className="btn-primary py-2 px-4 text-xs">
            Unlock AI Forecasting
          </button>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-surface-700 flex items-center justify-center mb-3">
          <Brain className="w-6 h-6 text-text-muted opacity-50" />
        </div>
        <h3 className="text-sm font-semibold text-text-primary">Predictive Forecasting</h3>
        <p className="text-[11px] text-text-muted mt-1 max-w-[180px]">
          Uses Gemini AI to predict your next month's bill based on historical trends.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card h-full flex flex-col items-center justify-center p-6 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
        <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Consulting Oracle...</p>
      </div>
    );
  }

  if (error === 'UPGRADE') {
      return (
        <div className="card h-full flex flex-col items-center justify-center text-center p-6">
          <ShieldAlert className="w-8 h-8 text-brand-400 mb-2" />
          <p className="text-sm font-bold text-text-primary">Upgrade Required</p>
          <button onClick={() => window.location.href='/pricing'} className="text-xs text-brand-400 mt-1 hover:underline">View Plans</button>
        </div>
      );
  }

  if (!data) {
    return (
      <div className="card h-full flex flex-col items-center justify-center text-center p-6">
        <Sparkles className="w-8 h-8 text-brand-500/30 mb-2" />
        <p className="text-sm font-medium text-text-secondary">Insufficient Data</p>
        <p className="text-[11px] text-text-muted mt-1">Add 1 more month of data to enable AI forecasting.</p>
      </div>
    );
  }

  const TrendIcon = data.trend === 'increasing' ? TrendingUp : data.trend === 'decreasing' ? TrendingDown : Minus;
  const trendColor = data.trend === 'increasing' ? 'text-red-400' : data.trend === 'decreasing' ? 'text-emerald-400' : 'text-blue-400';

  return (
    <div className="card h-full flex flex-col p-5 bg-gradient-to-br from-surface-800 to-surface-900 border-brand-500/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
            <Brain className="w-4 h-4 text-brand-400" />
          </div>
          <span className="text-xs font-bold text-text-primary uppercase tracking-tight">AI Forecast</span>
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-bold uppercase ${trendColor}`}>
          <TrendIcon className="w-3 h-3" />
          {data.trend}
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Expected Next Month</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-text-primary">₱{data.predictedBill.toLocaleString()}</span>
            <span className="text-sm font-mono text-text-secondary">({data.predictedKwh} kWh)</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-surface-700/50 border border-white/5">
          <p className="text-[11px] text-text-secondary leading-relaxed italic">
            "{data.reasoning}"
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${data.confidence === 'high' ? 'bg-emerald-500' : data.confidence === 'medium' ? 'bg-amber-500' : 'bg-red-500'}`} />
          <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">{data.confidence} Confidence</span>
        </div>
        <span className="text-[10px] text-brand-500/50 font-mono">Gemini 2.5 Flash</span>
      </div>
    </div>
  );
}
