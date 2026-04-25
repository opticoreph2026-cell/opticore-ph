'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { UserPlus, CreditCard, Cpu, FileText, Zap, Radio, Sun, AlertTriangle, ShieldAlert } from 'lucide-react';

const TYPE_CONFIG = {
  new_user:    { icon: UserPlus,    color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
  payment:     { icon: CreditCard,  color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ai_scan:     { icon: Cpu,         color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20' },
  report:      { icon: FileText,    color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20' },
  ai_forecast: { icon: Zap,         color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  acoustic:    { icon: Radio,       color: 'text-pink-400',    bg: 'bg-pink-500/10',    border: 'border-pink-500/20' },
  solar:       { icon: Sun,         color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20' },
  system:      { icon: AlertTriangle, color: 'text-red-400',   bg: 'bg-red-500/10',     border: 'border-red-500/20' },
};

export default function AdminNotificationFeed({ initialData = [] }) {
  const [feed, setFeed] = useState(initialData);

  useEffect(() => {
    // Poll every 60s for the latest 5 to keep the dashboard feed alive
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/admin/notifications');
        const data = await res.json();
        // Just take top 5 for the side widget
        if (data.notifications) {
          setFeed(data.notifications.slice(0, 5));
        }
      } catch {}
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* Production Shield Note */}
      <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex gap-3">
        <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
        <div>
          <p className="text-xs font-bold text-red-300 mb-1">Production Shield Active</p>
          <p className="text-[10px] text-red-400/70 leading-relaxed">External database sync is restricted to authorized agents.</p>
        </div>
      </div>

      <div className="pt-2">
        <h3 className="text-[10px] font-black text-text-faint uppercase tracking-widest mb-3">Live Activity Feed</h3>
        <div className="space-y-2">
          {feed.length === 0 ? (
            <p className="text-xs text-text-muted italic py-2">No recent activity.</p>
          ) : (
            feed.map((n) => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
              const Icon = cfg.icon;
              return (
                <div key={n.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex gap-3 items-start">
                  <div className={`w-8 h-8 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-primary leading-tight">{n.title}</p>
                    <p className="text-[10px] text-text-muted mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                    <p className="text-[9px] text-text-faint mt-1.5 font-medium">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
