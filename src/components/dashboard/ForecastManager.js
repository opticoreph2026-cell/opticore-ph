'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Minus, 
  AlertCircle, Sparkles, Loader2,
  Calendar, Zap, Wallet
} from 'lucide-react';
import { clsx } from 'clsx';

export default function ForecastManager() {
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchForecast();
  }, []);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/forecast');
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate forecast.');
      }
      
      setForecast(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bento-card p-20 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-10 h-10 text-brand-400 animate-spin mb-4" />
        <p className="text-sm text-text-muted">OptiCore Predictive Engine is calculating your next bill...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bento-card p-12 flex flex-col items-center justify-center text-center border-rose-500/20">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Forecasting Unavailable</h3>
        <p className="text-sm text-text-muted max-w-sm mb-6">{error}</p>
        <button onClick={fetchForecast} className="btn-secondary">Try Again</button>
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="bento-card p-12 flex flex-col items-center justify-center text-center">
        <Calendar className="w-12 h-12 text-slate-500 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Insufficient Data</h3>
        <p className="text-sm text-text-muted max-w-sm">
          We need at least 2 months of utility readings to build a reliable predictive model for your property.
        </p>
      </div>
    );
  }

  const { trend, predictedKwh, predictedBill, confidence, reasoning } = forecast;

  return (
    <div className="space-y-6">
      {/* ── Hero Stats ── */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bento-card p-6 border-l-4 border-l-brand-500"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-faint">Next Month Pred.</p>
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-brand-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h4 className="text-4xl font-black text-white">{predictedKwh}</h4>
            <span className="text-sm font-bold text-text-muted uppercase">kWh</span>
          </div>
          <p className="text-xs text-text-muted mt-2">Expected electricity usage</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bento-card p-6 border-l-4 border-l-cyan-500"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-faint">Estimated Bill</p>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h4 className="text-4xl font-black text-white">₱{predictedBill.toLocaleString()}</h4>
            <span className="text-sm font-bold text-text-muted uppercase">PHP</span>
          </div>
          <p className="text-xs text-text-muted mt-2">Predicted financial impact</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bento-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-faint">Trend Analysis</p>
            <div className={clsx(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              trend === 'increasing' ? "bg-rose-500/10" : trend === 'decreasing' ? "bg-emerald-500/10" : "bg-slate-500/10"
            )}>
              {trend === 'increasing' ? <TrendingUp className="w-4 h-4 text-rose-500" /> : 
               trend === 'decreasing' ? <TrendingDown className="w-4 h-4 text-emerald-500" /> : 
               <Minus className="w-4 h-4 text-slate-500" />}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h4 className={clsx(
              "text-3xl font-black uppercase tracking-tight",
              trend === 'increasing' ? "text-rose-400" : trend === 'decreasing' ? "text-emerald-400" : "text-white"
            )}>
              {trend}
            </h4>
          </div>
          <p className="text-xs text-text-muted mt-2">Overall trajectory</p>
        </motion.div>
      </div>

      {/* ── AI Insights ── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bento-card p-8 bg-gradient-to-br from-brand-500/[0.03] to-cyan-500/[0.03] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="w-24 h-24 text-brand-400" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">AI Reasoning</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Model Confidence:</span>
                <span className={clsx(
                  "text-[10px] font-black uppercase tracking-widest",
                  confidence === 'high' ? "text-emerald-400" : confidence === 'medium' ? "text-amber-400" : "text-rose-400"
                )}>
                  {confidence}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] mb-8">
            <p className="text-lg text-slate-200 font-medium leading-relaxed italic">
              \"{reasoning}\"
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/10">
              <p className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-1">Business Impact</p>
              <p className="text-sm text-slate-400">
                Accurate forecasting allows for better operational budgeting and identifying potential system inefficiencies before they escalate.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
              <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">Seasonal Adjustment</p>
              <p className="text-sm text-slate-400">
                Our model accounts for Philippine tropical seasons (El Niño/Amihan) to adjust expected cooling demands.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
