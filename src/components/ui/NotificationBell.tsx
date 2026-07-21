'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, X, CheckCheck, Users, Zap, Package, TrendingUp, AlertCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  meta?: string;
  isRead: boolean;
  createdAt: string;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  lead: { icon: Users, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10' },
  project: { icon: Zap, color: 'text-accent-amber', bg: 'bg-accent-amber/10' },
  payment: { icon: TrendingUp, color: 'text-accent-emerald', bg: 'bg-accent-emerald/10' },
  system: { icon: Package, color: 'text-foreground-950/60', bg: 'bg-foreground-950/5' },
  alert: { icon: AlertCircle, color: 'text-accent-rose', bg: 'bg-accent-rose/10' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = useCallback(() => {
    setFetchError(false);
    fetch('/api/notifications')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch');
        return r.json();
      })
      .then((json) => setNotifications(json.data ?? []))
      .catch(() => { setFetchError(true); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    const ids = notifications.filter((n) => !n.isRead).map((n) => n.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await Promise.allSettled(
      ids.map((id) =>
        fetch(`/api/notifications/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true }),
        }),
      ),
    );
  };

  const markRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    fetch(`/api/notifications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead: true }),
    }).catch(() => {});
  };

  const dismiss = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    fetch(`/api/notifications/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleClick = (notif: Notification) => {
    markRead(notif.id);
    setOpen(false);
    if (notif.meta) {
      try {
        const meta = JSON.parse(notif.meta);
        if (meta.href) {
          router.push(meta.href);
        }
      } catch { /* ignore */ }
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        id="notification-bell"
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-foreground-950/5 transition-colors group"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-foreground-950/60 group-hover:text-foreground-950 transition-colors" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-rose ring-2 ring-background-950 animate-pulse" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[380px] z-50 bg-background-900 border border-foreground-950/8 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden max-[420px]:fixed max-[420px]:left-2 max-[420px]:right-2 max-[420px]:w-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-foreground-950/5">
            <div>
              <h3 className="font-display font-semibold text-foreground-950">Notifications</h3>
              {unread > 0 && (
                <p className="text-xs text-foreground-950/40 mt-0.5">{unread} unread</p>
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
                <div className="w-6 h-6 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-foreground-950/40">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-8 h-8 text-foreground-950/20 mx-auto mb-3" />
                <p className="text-sm text-foreground-950/40">No notifications</p>
              </div>
            ) : fetchError ? (
              <div className="py-12 text-center">
                <AlertCircle className="w-8 h-8 text-accent-rose/50 mx-auto mb-3" />
                <p className="text-sm text-foreground-950/40">Could not load notifications.</p>
                <button
                  onClick={fetchNotifications}
                  className="mt-2 text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors"
                >
                  Try again
                </button>
              </div>
            ) : (
              notifications.map((notif) => {
                const cfg = typeConfig[notif.type] ?? typeConfig.system;
                const Icon = cfg!.icon;
                return (
                  <div
                    key={notif.id}
                    className={`flex gap-3 px-5 py-4 border-b border-foreground-950/4 hover:bg-foreground-950/3 transition-colors cursor-pointer ${
                      !notif.isRead ? 'bg-foreground-950/[0.02]' : ''
                    }`}
                    onClick={() => handleClick(notif)}
                  >
                    <div className={`w-9 h-9 rounded-xl ${cfg!.bg} flex-shrink-0 flex items-center justify-center mt-0.5`}>
                      <Icon className={`w-4 h-4 ${cfg!.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium leading-tight ${!notif.isRead ? 'text-foreground-950' : 'text-foreground-950/70'}`}>
                          {notif.title}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dismiss(notif.id);
                          }}
                          className="flex-shrink-0 p-0.5 text-foreground-950/20 hover:text-foreground-950/60 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs text-foreground-950/50 mt-1 leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-foreground-950/30 mt-1.5 font-medium">
                        {timeAgo(notif.createdAt)}
                      </p>
                    </div>

                    {!notif.isRead && (
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan flex-shrink-0 mt-2" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="px-5 py-3 border-t border-foreground-950/5">
            <button
              onClick={() => { setOpen(false); router.push('/admin/alerts'); }}
              className="text-xs text-foreground-950/40 hover:text-foreground-950/70 transition-colors"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
