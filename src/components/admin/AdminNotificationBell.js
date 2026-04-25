'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, UserPlus, CreditCard, Cpu, FileText, Zap, Radio, Sun, AlertTriangle, CheckCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';

const TYPE_CONFIG = {
  new_user:    { icon: UserPlus,    color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    label: 'New User' },
  payment:     { icon: CreditCard,  color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Payment' },
  ai_scan:     { icon: Cpu,         color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',    label: 'AI Scan' },
  report:      { icon: FileText,    color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  label: 'Report' },
  ai_forecast: { icon: Zap,         color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   label: 'Forecast' },
  acoustic:    { icon: Radio,       color: 'text-pink-400',    bg: 'bg-pink-500/10',    border: 'border-pink-500/20',    label: 'Acoustic Scan' },
  solar:       { icon: Sun,         color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20',  label: 'Solar Analysis' },
  system:      { icon: AlertTriangle, color: 'text-red-400',   bg: 'bg-red-500/10',     border: 'border-red-500/20',     label: 'System' },
};

export default function AdminNotificationBell() {
  const [isOpen,       setIsOpen]       = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [loading,      setLoading]      = useState(false);
  const popoverRef = useRef(null);
  const pollRef    = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res  = await fetch('/api/admin/notifications');
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {}
  }, []);

  // Fetch on mount + poll every 30s
  useEffect(() => {
    fetchNotifications();
    pollRef.current = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(pollRef.current);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function markOne(id) {
    setNotifications(n => n.map(x => x.id === id ? { ...x, isRead: true } : x));
    setUnreadCount(c => Math.max(0, c - 1));
    await fetch('/api/admin/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  }

  async function markAll() {
    setLoading(true);
    setNotifications(n => n.map(x => ({ ...x, isRead: true })));
    setUnreadCount(0);
    await fetch('/api/admin/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    }).finally(() => setLoading(false));
  }

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="relative p-2.5 rounded-xl transition-all group"
        style={{
          background: isOpen ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${isOpen ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.08)'}`,
        }}
        aria-label="Admin notifications"
      >
        <Bell className={`w-5 h-5 transition-all group-hover:rotate-12 ${isOpen ? 'text-brand-400' : 'text-white/60 group-hover:text-white'}`} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-black flex items-center justify-center"
              style={{ background: '#ef4444', color: '#fff', boxShadow: '0 0 8px rgba(239,68,68,0.5)' }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
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
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute right-0 mt-3 w-[22rem] rounded-2xl shadow-2xl z-50 overflow-hidden"
            style={{
              background: 'rgba(14,14,20,0.97)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.18em] text-white">Notifications</h3>
                <p className="text-[10px] text-white/30 mt-0.5 font-bold uppercase tracking-tight">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAll}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-[10px] font-black text-brand-400 hover:text-brand-300 uppercase tracking-tighter transition-colors disabled:opacity-50"
                  >
                    <CheckCheck className="w-3 h-3" /> Mark all read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg text-white/20 hover:text-white/60 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-12 flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center">
                    <CheckCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="text-xs font-bold text-white/40">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {notifications.map((n) => {
                    const cfg  = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system;
                    const Icon = cfg.icon;
                    return (
                      <div
                        key={n.id}
                        className={`px-4 py-3.5 flex gap-3 transition-colors cursor-pointer ${
                          n.isRead ? 'opacity-50' : 'hover:bg-white/[0.03]'
                        }`}
                        onClick={() => !n.isRead && markOne(n.id)}
                      >
                        {/* Type icon */}
                        <div className={`w-8 h-8 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0 mt-0.5`}>
                          <Icon className={`w-4 h-4 ${cfg.color}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className={`text-[9px] font-black uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
                              <p className="text-[11px] font-bold text-white leading-tight mt-0.5">{n.title}</p>
                              <p className="text-[10px] text-white/40 leading-relaxed mt-0.5 line-clamp-2">{n.message}</p>
                            </div>
                            {!n.isRead && (
                              <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1" style={{ boxShadow: '0 0 6px rgba(245,158,11,0.6)' }} />
                            )}
                          </div>
                          {/* Meta */}
                          {n.meta?.email && (
                            <p className="text-[9px] text-white/25 mt-1 font-mono truncate">{n.meta.email}</p>
                          )}
                          <p className="text-[9px] text-white/20 mt-1">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
