'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell, TriangleAlert, Info, ShieldCheck, CheckCheck, ChevronRight, X, Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

const SEVERITY = {
  critical: { icon: TriangleAlert, color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/20' },
  warning:  { icon: TriangleAlert, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  info:     { icon: Info,          color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/20' },
};

export default function NotificationPopover() {
  const [isOpen,      setIsOpen]      = useState(false);
  const [alerts,      setAlerts]      = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading,     setLoading]     = useState(false);
  const [marking,     setMarking]     = useState(false);
  const popoverRef = useRef(null);
  const pollRef    = useRef(null);

  // Fetch unread count on mount (for the badge) and every 60 s
  const fetchAlerts = useCallback(async () => {
    try {
      const res  = await fetch('/api/dashboard/data?section=alerts');
      const data = await res.json();
      const list = data.alerts ?? [];
      setAlerts(list);
      setUnreadCount(list.filter(a => !a.isRead).length);
    } catch {}
  }, []);

  useEffect(() => {
    fetchAlerts();
    pollRef.current = setInterval(fetchAlerts, 60_000);
    return () => clearInterval(pollRef.current);
  }, [fetchAlerts]);

  // Full load when panel opens
  useEffect(() => {
    if (isOpen) { setLoading(true); fetchAlerts().finally(() => setLoading(false)); }
  }, [isOpen, fetchAlerts]);

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function markOneRead(alertId) {
    setAlerts(a => a.map(x => x.id === alertId ? { ...x, isRead: true } : x));
    setUnreadCount(c => Math.max(0, c - 1));
    await fetch('/api/dashboard/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'alert-read', id: alertId }),
    }).catch(() => {});
  }

  async function markAllRead() {
    if (marking) return;
    setMarking(true);
    setAlerts(a => a.map(x => ({ ...x, isRead: true })));
    setUnreadCount(0);
    // Mark all via individual calls (reuse existing API)
    const unread = alerts.filter(a => !a.isRead);
    await Promise.all(
      unread.map(a =>
        fetch('/api/dashboard/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ section: 'alert-read', id: a.id }),
        }).catch(() => {})
      )
    );
    setMarking(false);
  }

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="relative p-2.5 rounded-xl transition-all group"
        style={{
          background: isOpen ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${isOpen ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.08)'}`,
        }}
        aria-label="Notifications"
      >
        <Bell className={`w-5 h-5 transition-all group-hover:rotate-12 ${isOpen ? 'text-brand-400' : 'text-white/60 group-hover:text-white'}`} />

        {/* Unread badge — visible without opening */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-0.5 rounded-full text-[8px] font-black flex items-center justify-center"
              style={{ background: 'rgb(245,158,11)', color: '#000', boxShadow: '0 0 8px rgba(245,158,11,0.5)' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute right-0 mt-3 w-80 lg:w-96 rounded-2xl shadow-2xl z-50 overflow-hidden"
            style={{
              background: 'rgba(12,12,18,0.96)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-[0.18em]">Intelligence Feed</h3>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-tight mt-0.5">Real-time Grid & Usage Alerts</p>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    disabled={marking}
                    className="flex items-center gap-1 text-[9px] font-black text-brand-400 hover:text-brand-300 uppercase tracking-tighter transition-colors disabled:opacity-40"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark all
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg text-white/20 hover:text-white/60 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="p-8 flex flex-col items-center gap-3">
                  <div className="w-5 h-5 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Scanning Grid…</span>
                </div>
              ) : alerts.length > 0 ? (
                <div className="divide-y divide-white/[0.04]">
                  {alerts.map((alert) => {
                    const cfg  = SEVERITY[alert.severity] ?? SEVERITY.info;
                    const Icon = cfg.icon;
                    return (
                      <div
                        key={alert.id}
                        onClick={() => !alert.isRead && markOneRead(alert.id)}
                        className={`p-4 transition-colors group relative ${alert.isRead ? 'opacity-50' : 'hover:bg-white/[0.02] cursor-pointer'}`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded-lg ${cfg.bg} ${cfg.border} border flex items-center justify-center shrink-0`}>
                            <Icon className={`w-4 h-4 ${cfg.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-bold text-white line-clamp-1">{alert.title}</p>
                              {!alert.isRead && (
                                <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1"
                                  style={{ boxShadow: '0 0 6px rgba(245,158,11,0.6)' }} />
                              )}
                            </div>
                            <p className="text-[11px] text-white/40 leading-relaxed mt-0.5 line-clamp-2">{alert.message}</p>
                            <p className="text-[9px] text-white/20 mt-1.5">
                              {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-10 flex flex-col items-center text-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center">
                    <ShieldCheck className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">All Systems Optimal</h4>
                    <p className="text-[11px] text-white/30 mt-1">No anomalies detected in your grid sector.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <Link
              href="/dashboard/alerts"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 p-4 border-t border-white/[0.05] bg-white/[0.01] hover:bg-brand-500/8 transition-all group"
            >
              <Zap className="w-3 h-3 text-white/20 group-hover:text-brand-400 transition-colors" />
              <span className="text-[10px] font-black text-white/30 group-hover:text-brand-400 uppercase tracking-[0.2em] transition-colors">
                View All Intelligence
              </span>
              <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-brand-400 transition-colors" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
