'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  TriangleAlert, 
  Info, 
  X, 
  ShieldCheck, 
  Filter, 
  CheckCheck,
  Zap,
  Droplets,
  Flame,
  TrendingUp,
  History
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Spinner from '@/components/ui/Spinner';

const SEVERITY_CONFIG = {
  critical: {
    color: 'text-rose-400',
    accentBg: 'rgba(251,113,133,0.08)',
    accentBorder: 'rgba(251,113,133,0.20)',
    barColor: '#fb7185',
    label: 'Critical',
    icon: TriangleAlert
  },
  warning: {
    color: 'text-amber-400',
    accentBg: 'rgba(251,191,36,0.08)',
    accentBorder: 'rgba(251,191,36,0.20)',
    barColor: '#fbbf24',
    label: 'Warning',
    icon: TriangleAlert
  },
  info: {
    color: 'text-cyan-400',
    accentBg: 'rgba(34,211,238,0.08)',
    accentBorder: 'rgba(34,211,238,0.20)',
    barColor: '#22d3ee',
    label: 'Info',
    icon: Info
  },
};

const TYPE_ICONS = {
  ghost_load: Zap,
  water_leak: Droplets,
  lpg: Flame,
  spike: TrendingUp,
  rate: History
};

export default function AlertsFeed() {
  const [alerts, setAlerts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ severity: '', read: 'false', type: '' });
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.severity) params.append('severity', filter.severity);
      if (filter.read) params.append('read', filter.read);
      if (filter.type) params.append('type', filter.type);

      const res = await fetch(`/api/dashboard/alerts?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setAlerts(data.alerts);
        setMeta(data.meta);
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const markRead = async (id) => {
    try {
      const res = await fetch('/api/dashboard/alerts', {
        method: 'PUT',
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        // Optimistic update
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
        // If we are filtering by unread, remove it
        if (filter.read === 'false') {
          setTimeout(() => setAlerts(prev => prev.filter(a => a.id !== id)), 300);
        }
      }
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const markAllRead = async () => {
    if (isMarkingAll) return;
    setIsMarkingAll(true);
    try {
      const res = await fetch('/api/dashboard/alerts', {
        method: 'PUT',
        body: JSON.stringify({ bulk: true })
      });
      if (res.ok) {
        setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
        if (filter.read === 'false') {
          setAlerts([]);
        }
      }
    } catch (err) {
      console.error('Failed to mark all read:', err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── KPI Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPIItem 
          label="Unread Alerts" 
          value={meta?.unreadCount ?? 0} 
          icon={Bell} 
          color="text-amber-400" 
          bg="rgba(251,191,36,0.05)"
        />
        <KPIItem 
          label="Critical Active" 
          value={meta?.criticalCount ?? 0} 
          icon={TriangleAlert} 
          color="text-rose-400" 
          bg="rgba(251,113,133,0.05)"
        />
        <KPIItem 
          label="Latest Update" 
          value={meta?.latestTime ? formatDistanceToNow(new Date(meta.latestTime), { addSuffix: true }) : 'Never'} 
          icon={History} 
          color="text-cyan-400" 
          bg="rgba(34,211,238,0.05)"
          isTime
        />
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bento-card p-4">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-white/40" />
          <select 
            value={filter.severity} 
            onChange={(e) => setFilter(f => ({ ...f, severity: e.target.value }))}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>

          <select 
            value={filter.type} 
            onChange={(e) => setFilter(f => ({ ...f, type: e.target.value }))}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
          >
            <option value="">All Types</option>
            <option value="ghost_load">Ghost Load</option>
            <option value="water_leak">Water Leak</option>
            <option value="spike">Usage Spike</option>
            <option value="rate">Rate Change</option>
          </select>

          <select 
            value={filter.read} 
            onChange={(e) => setFilter(f => ({ ...f, read: e.target.value }))}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
          >
            <option value="false">Unread Only</option>
            <option value="true">Read History</option>
            <option value="">All Alerts</option>
          </select>
        </div>

        <button 
          onClick={markAllRead}
          disabled={isMarkingAll || alerts.length === 0}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30"
        >
          <CheckCheck className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      {/* ── Alert Feed ── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <AlertSkeleton key={i} />)}
        </div>
      ) : alerts.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {alerts.map((alert) => (
              <AlertItem 
                key={alert.id} 
                alert={alert} 
                onMarkRead={() => markRead(alert.id)} 
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bento-card p-16 flex flex-col items-center text-center gap-5"
        >
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-emerald-400/10 border border-emerald-400/20">
            <ShieldCheck className="w-9 h-9 text-emerald-400" />
          </div>
          <div>
            <h2 className="font-bold text-white text-lg mb-2">System Optimized</h2>
            <p className="text-sm text-white/40 max-w-xs leading-relaxed">
              No alerts matching your current filters. OptiCore is monitoring your utility flow in the background.
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/5 border border-emerald-400/10">
            ✓ Guard Active
          </div>
        </motion.div>
      )}
    </div>
  );
}

function AlertItem({ alert, onMarkRead }) {
  const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
  const TypeIcon = TYPE_ICONS[alert.type] || Zap;
  const SeverityIcon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative bento-card p-0 overflow-hidden group flex items-stretch transition-all duration-500 ${alert.isRead ? 'opacity-60' : 'opacity-100 shadow-lg shadow-black/20'}`}
    >
      {/* Left severity bar */}
      <div className="w-1.5 shrink-0" style={{ background: cfg.barColor }} />

      <div className="flex items-start gap-4 flex-1 p-5">
        {/* Icon Cluster */}
        <div className="relative shrink-0 mt-0.5">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: cfg.accentBg, border: `1px solid ${cfg.accentBorder}` }}
          >
            <TypeIcon className={`w-5 h-5 ${cfg.color}`} />
          </div>
          {/* Unread indicator */}
          {!alert.isRead && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-[#0a0a0b] animate-pulse" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <span 
              className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full"
              style={{ background: cfg.accentBg, color: cfg.barColor, border: `1px solid ${cfg.accentBorder}` }}
            >
              {cfg.label}
            </span>
            <span className="text-[10px] text-white/25 font-medium flex items-center gap-1.5">
              <History className="w-3 h-3" />
              {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
            {alert.title}
          </p>
          <p className="text-sm text-white/50 leading-relaxed max-w-2xl">
            {alert.message}
          </p>
        </div>

        {/* Actions */}
        {!alert.isRead && (
          <button
            onClick={onMarkRead}
            className="shrink-0 p-2 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/[0.05] transition-all opacity-0 group-hover:opacity-100"
            title="Mark as read"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

function KPIItem({ label, value, icon: Icon, color, bg, isTime }) {
  return (
    <div className="bento-card p-5 flex items-center gap-4 group hover:border-white/20 transition-all">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`} style={{ background: bg }}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{label}</p>
        <p className={`text-xl font-black ${isTime ? 'text-lg' : 'text-2xl'} text-white`}>{value}</p>
      </div>
    </div>
  );
}

function AlertSkeleton() {
  return (
    <div className="bento-card p-0 h-24 overflow-hidden flex animate-pulse">
      <div className="w-1.5 bg-white/5 h-full" />
      <div className="flex items-center gap-4 p-5 flex-1">
        <div className="w-10 h-10 bg-white/5 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-white/5 w-24 rounded-full" />
          <div className="h-4 bg-white/5 w-48 rounded-full" />
          <div className="h-3 bg-white/5 w-64 rounded-full" />
        </div>
      </div>
    </div>
  );
}
