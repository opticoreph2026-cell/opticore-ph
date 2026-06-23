'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, Users, Zap, Package, TrendingUp, AlertCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'lead' | 'project' | 'payment' | 'system' | 'alert';
  title: string;
  message: string;
  time: string;
  read: boolean;
  href?: string;
}

const typeConfig = {
  lead: { icon: Users, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10' },
  project: { icon: Zap, color: 'text-accent-amber', bg: 'bg-accent-amber/10' },
  payment: { icon: TrendingUp, color: 'text-accent-emerald', bg: 'bg-accent-emerald/10' },
  system: { icon: Package, color: 'text-white/60', bg: 'bg-white/5' },
  alert: { icon: AlertCircle, color: 'text-accent-rose', bg: 'bg-accent-rose/10' },
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((json) => setNotifications(json.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div ref={ref} className="relative">
      <button
        id="notification-bell"
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-white/5 transition-colors group"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-rose ring-2 ring-[#08080B] animate-pulse" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[380px] z-50 bg-[#0F0F14] border border-white/8 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div>
              <h3 className="font-display font-semibold text-white">Notifications</h3>
              {unread > 0 && (
                <p className="text-xs text-white/40 mt-0.5">{unread} unread</p>
              )}
            </div>
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors font-medium"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="py-12 text-center">
                <div className="w-6 h-6 border-2 border-accent-amber border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-white/40">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-8 h-8 text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/40">No notifications</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const cfg = typeConfig[notif.type];
                const Icon = (cfg ?? typeConfig.system)!.icon;
                const color = (cfg ?? typeConfig.system)!.color;
                const bg = (cfg ?? typeConfig.system)!.bg;
                return (
                  <div
                    key={notif.id}
                    className={`flex gap-3 px-5 py-4 border-b border-white/4 hover:bg-white/3 transition-colors cursor-pointer ${
                      !notif.read ? 'bg-white/[0.02]' : ''
                    }`}
                    onClick={() => {
                      markRead(notif.id);
                      if (notif.href) {
                        window.location.href = notif.href;
                        setOpen(false);
                      }
                    }}
                  >
                    <div className={`w-9 h-9 rounded-xl ${bg} flex-shrink-0 flex items-center justify-center mt-0.5`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium leading-tight ${!notif.read ? 'text-white' : 'text-white/70'}`}>
                          {notif.title}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dismiss(notif.id);
                          }}
                          className="flex-shrink-0 p-0.5 text-white/20 hover:text-white/60 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs text-white/50 mt-1 leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-white/30 mt-1.5 font-medium">
                        {notif.time}
                      </p>
                    </div>

                    {!notif.read && (
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan flex-shrink-0 mt-2" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="px-5 py-3 border-t border-white/5">
            <button className="text-xs text-white/40 hover:text-white/70 transition-colors">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
