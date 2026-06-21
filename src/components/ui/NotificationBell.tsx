'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, Zap, Users, Package, TrendingUp, AlertCircle } from 'lucide-react';

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
  lead: { icon: Users, color: 'text-[#06B6D4]', bg: 'bg-[#06B6D4]/10' },
  project: { icon: Zap, color: 'text-[#F5A524]', bg: 'bg-[#F5A524]/10' },
  payment: { icon: TrendingUp, color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' },
  system: { icon: Package, color: 'text-white/60', bg: 'bg-white/5' },
  alert: { icon: AlertCircle, color: 'text-[#F43F5E]', bg: 'bg-[#F43F5E]/10' },
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'lead',
      title: 'New Lead Captured',
      message: 'Maria Santos submitted an ROI inquiry from Cebu City.',
      time: '2 min ago',
      read: false,
      href: '/crm/leads',
    },
    {
      id: '2',
      type: 'project',
      title: 'Installation Scheduled',
      message: 'Project #PRJ-004 (Dela Cruz Residence) confirmed for Jun 25.',
      time: '1 hr ago',
      read: false,
      href: '/crm/projects',
    },
    {
      id: '3',
      type: 'payment',
      title: 'Deposit Received',
      message: '₱75,000 deposit received for Quotation #QT-2026-018.',
      time: '3 hrs ago',
      read: false,
    },
    {
      id: '4',
      type: 'system',
      title: 'Design Finalized',
      message: 'Engr. Jeric finalized the Neovolt 10.1 kWh design for Site #S-012.',
      time: '6 hrs ago',
      read: true,
    },
    {
      id: '5',
      type: 'alert',
      title: 'ERC Type Approval Expiring',
      message: 'DEKRA certificate for BW-INV-SPH5K expires in 30 days.',
      time: '1 day ago',
      read: true,
    },
  ]);

  const ref = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;

  // Close on outside click
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
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F43F5E] ring-2 ring-[#08080B] animate-pulse" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[380px] z-50 bg-[#0F0F14] border border-white/8 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div>
              <h3 className="font-display font-semibold text-white">Notifications</h3>
              {unread > 0 && (
                <p className="text-xs text-white/40 mt-0.5">{unread} unread</p>
              )}
            </div>
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs text-[#06B6D4] hover:text-[#06B6D4]/80 transition-colors font-medium"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-8 h-8 text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/40">No notifications</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const { icon: Icon, color, bg } = typeConfig[notif.type];
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
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-xl ${bg} flex-shrink-0 flex items-center justify-center mt-0.5`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>

                    {/* Content */}
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

                    {/* Unread dot */}
                    {!notif.read && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] flex-shrink-0 mt-2" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
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
