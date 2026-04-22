'use client';

import { useState, useEffect } from 'react';
import { Bell, TriangleAlert, CheckCircle, Info, X, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import Spinner from '@/components/ui/Spinner';

const SEVERITY = {
  critical: {
    icon: TriangleAlert,
    color: 'text-red-400',
    accentBg: 'rgba(239,68,68,0.08)',
    accentBorder: 'rgba(239,68,68,0.20)',
    barColor: '#f87171',
    label: 'Critical',
  },
  warning: {
    icon: TriangleAlert,
    color: 'text-orange-400',
    accentBg: 'rgba(249,115,22,0.08)',
    accentBorder: 'rgba(249,115,22,0.20)',
    barColor: '#fb923c',
    label: 'Warning',
  },
  info: {
    icon: Info,
    color: 'text-blue-400',
    accentBg: 'rgba(96,165,250,0.08)',
    accentBorder: 'rgba(96,165,250,0.20)',
    barColor: '#60a5fa',
    label: 'Info',
  },
};

export default function AlertsPage() {
  const [alerts,  setAlerts]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/data?section=alerts')
      .then(r => r.json())
      .then(d => setAlerts(d.alerts ?? []))
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }, []);

  const dismissAlert = async (id) => {
    try {
      await fetch(`/api/dashboard/data?section=alert-read&id=${id}`, { method: 'POST' });
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="section-label mb-1">Intelligence</p>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-orange-400" />
            Alerts
          </h1>
          <p className="text-sm text-white/40 mt-1">
            Real-time notifications about utility usage anomalies.
          </p>
        </div>
        {alerts.length > 0 && (
          <span
            className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mt-1"
            style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' }}
          >
            {alerts.length} Active
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const severity = alert.severity ?? 'info';
            const cfg = SEVERITY[severity] ?? SEVERITY.info;
            const Icon = cfg.icon;

            return (
              <div
                key={alert.id}
                className="relative bento-card p-0 overflow-hidden group flex items-stretch"
              >
                {/* Left severity bar */}
                <div
                  className="w-1 shrink-0 rounded-l-2xl"
                  style={{ background: cfg.barColor }}
                />

                <div className="flex items-start gap-4 flex-1 p-5">
                  {/* Icon */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: cfg.accentBg, border: `1px solid ${cfg.accentBorder}` }}
                  >
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <span
                        className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full"
                        style={{ background: cfg.accentBg, color: cfg.barColor, border: `1px solid ${cfg.accentBorder}` }}
                      >
                        {cfg.label}
                      </span>
                      <span className="text-[10px] text-white/25 font-medium">
                        {alert.createdAt
                          ? format(new Date(alert.createdAt), 'MMM d, yyyy · h:mm a')
                          : 'Recent'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white mb-1">
                      {alert.title ?? 'Usage Alert'}
                    </p>
                    <p className="text-sm text-white/50 leading-relaxed">
                      {alert.message ?? 'An anomaly was detected in your utility usage.'}
                    </p>
                  </div>

                  {/* Dismiss */}
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="shrink-0 p-1.5 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/[0.05] transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <div className="bento-card p-16 flex flex-col items-center text-center gap-5">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.20)' }}
          >
            <ShieldCheck className="w-9 h-9 text-emerald-400" />
          </div>
          <div>
            <h2 className="font-bold text-white text-lg mb-2">All Clear!</h2>
            <p className="text-sm text-white/40 max-w-xs leading-relaxed">
              No active alerts. We&apos;ll notify you the moment we detect any energy anomalies or ghost loads.
            </p>
          </div>
          <div
            className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-400"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)' }}
          >
            ✓ Monitoring Active
          </div>
        </div>
      )}
    </div>
  );
}
