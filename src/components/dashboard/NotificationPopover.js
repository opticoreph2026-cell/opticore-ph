'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, TriangleAlert, Info, ShieldCheck, X, ChevronRight, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { format } from 'date-fns';

export default function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const popoverRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/dashboard/data?section=alerts')
        .then(r => r.json())
        .then(d => setAlerts(d.alerts ?? []))
        .catch(() => setAlerts([]))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const SEVERITY = {
    critical: { icon: TriangleAlert, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
    warning:  { icon: TriangleAlert, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
    info:     { icon: Info,          color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all group"
      >
        <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        {alerts.length > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-brand-500 rounded-full border-2 border-surface-950 shadow-[0_0_10px_rgba(var(--brand-500),0.5)]" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute right-0 mt-3 w-80 lg:w-96 bg-surface-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Intelligence Feed</h3>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter mt-0.5">Real-time Grid & Usage Alerts</p>
              </div>
              {alerts.length > 0 && (
                <span className="text-[10px] font-black bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full border border-brand-500/20">
                  {alerts.length} NEW
                </span>
              )}
            </div>

            {/* Content */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="p-8 flex flex-col items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Scanning Grid...</span>
                </div>
              ) : alerts.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {alerts.map((alert) => {
                    const cfg = SEVERITY[alert.severity] ?? SEVERITY.info;
                    const Icon = cfg.icon;
                    return (
                      <div key={alert.id} className="p-4 hover:bg-white/[0.03] transition-colors group relative">
                        <div className="flex gap-4">
                          <div className={`w-8 h-8 rounded-lg ${cfg.bg} ${cfg.border} border flex items-center justify-center shrink-0`}>
                            <Icon className={`w-4 h-4 ${cfg.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-black text-white/20 uppercase tracking-tighter">
                                {format(new Date(alert.createdAt), 'h:mm a')}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-white mb-0.5 line-clamp-1">{alert.title}</p>
                            <p className="text-[11px] text-white/50 leading-relaxed line-clamp-2">{alert.message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-10 flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">All Systems Optimal</h4>
                    <p className="text-[11px] text-white/40 mt-1">No anomalies detected in your grid sector.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <Link
              href="/dashboard/alerts"
              onClick={() => setIsOpen(false)}
              className="block p-4 bg-white/[0.02] hover:bg-brand-500/10 border-t border-white/5 text-center transition-all group"
            >
              <span className="text-[10px] font-black text-white/40 group-hover:text-brand-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                View All Intelligence <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
