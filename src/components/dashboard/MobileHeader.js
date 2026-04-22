'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import {
  Zap, Menu, X, LayoutDashboard, Lightbulb, Bell,
  FileText, Settings, LogOut, Cpu, Calculator, Database, ChevronRight
} from 'lucide-react';

const navItems = [
  { href: '/dashboard',                 label: 'Overview',        icon: LayoutDashboard },
  { href: '/dashboard/appliances',      label: 'My Appliances',   icon: Cpu },
  { href: '/dashboard/catalog',         label: 'Master Catalog',  icon: Database },
  { href: '/dashboard/recommendations', label: 'Recommendations', icon: Lightbulb },
  { href: '/dashboard/alerts',          label: 'Alerts',          icon: Bell },
  { href: '/dashboard/reports',         label: 'Reports',         icon: FileText },
  { href: '/dashboard/roi-simulator',   label: 'ROI Simulator',   icon: Calculator },
  { href: '/dashboard/settings',        label: 'Settings',        icon: Settings },
];

export default function DashboardMobileHeader({ user }) {
  const [open, setOpen] = useState(false);
  const pathname        = usePathname();
  const router          = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      {/* Sticky header bar */}
      <header
        className="lg:hidden sticky top-0 z-40 px-4 h-14 flex items-center gap-3"
        style={{
          background: 'rgba(10,10,15,0.88)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          borderBottom: '1px solid rgba(255,255,255,0.055)',
        }}
      >
        <button
          onClick={() => setOpen(true)}
          className="p-2 -ml-1.5 rounded-xl hover:bg-white/[0.06] transition-colors"
        >
          <Menu className="w-5 h-5 text-text-secondary" />
        </button>

        <Link href="/" className="flex items-center gap-2 flex-1">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.05) 100%)',
              border: '1px solid rgba(245,158,11,0.3)',
            }}
          >
            <Zap className="w-3.5 h-3.5 text-brand-400" />
          </div>
          <span className="font-bold text-sm shimmer-text">OptiCore PH</span>
        </Link>

        {/* User avatar */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-brand-400"
          style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.22)' }}
        >
          {user?.name?.charAt(0) ?? user?.email?.charAt(0) ?? 'U'}
        </div>
      </header>

      {/* Drawer overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Drawer panel */}
          <div
            className="relative w-64 h-full flex flex-col animate-slide-down"
            style={{
              background: 'rgba(10,10,15,0.97)',
              backdropFilter: 'blur(24px) saturate(160%)',
              borderRight: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-32 rounded-full bg-brand-500/6 blur-3xl pointer-events-none" />

            {/* Drawer header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.055)' }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.05) 100%)',
                    border: '1px solid rgba(245,158,11,0.28)',
                  }}
                >
                  <Zap className="w-3.5 h-3.5 text-brand-400" />
                </div>
                <span className="font-bold text-sm shimmer-text">OptiCore PH</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
              <p className="px-4 mb-3 text-[9px] font-black text-text-faint uppercase tracking-[0.22em]">
                Navigation
              </p>
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={clsx(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 cursor-pointer relative overflow-hidden',
                      active ? 'text-brand-300 font-bold' : 'text-text-muted hover:text-text-secondary font-semibold hover:bg-white/[0.035]'
                    )}
                    style={active ? {
                      background: 'linear-gradient(135deg, rgba(245,158,11,0.13) 0%, rgba(245,158,11,0.04) 100%)',
                      border: '1px solid rgba(245,158,11,0.22)',
                    } : {}}
                    onClick={() => setOpen(false)}
                  >
                    {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-brand-400" />}
                    <Icon className={clsx('w-4 h-4 shrink-0', active ? 'text-brand-400' : 'text-text-faint')} />
                    <span className="flex-1">{label}</span>
                    {active && <ChevronRight className="w-3 h-3 text-brand-500/50 shrink-0" />}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div
              className="px-3 py-4 space-y-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.045)' }}
            >
              <div
                className="px-3.5 py-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <p className="text-[9px] font-black text-text-faint uppercase tracking-[0.2em] mb-0.5">Signed in as</p>
                <p className="text-xs font-bold text-text-primary truncate">{user?.name ?? ''}</p>
                <p className="text-[10px] text-text-faint truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl w-full text-sm font-bold text-text-faint hover:text-red-400 hover:bg-red-500/5 transition-all"
              >
                <LogOut className="w-4 h-4 shrink-0" /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
