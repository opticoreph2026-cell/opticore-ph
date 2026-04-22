'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { clsx } from 'clsx';
import { useEffect } from 'react';
import {
  Zap, LayoutDashboard, Lightbulb, Bell, FileText,
  Settings, LogOut, ChevronRight, Cpu, Calculator, Database, Activity, Sun, Award
} from 'lucide-react';
import PropertySwitcher from '@/components/dashboard/PropertySwitcher';
import Logo from '@/components/ui/Logo';

/**
 * Grouped nav structure — premium logical sections
 * Mirrors how Linear, Notion, and Vercel organize their sidebars.
 */
const navGroups = [
  {
    label: 'Command Center',
    items: [
      { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    ],
  },
  {
    label: 'My Assets',
    items: [
      { href: '/dashboard/appliances', label: 'My Appliances', icon: Cpu },
      { href: '/dashboard/catalog',    label: 'Master Catalog', icon: Database },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { href: '/dashboard/recommendations', label: 'Recommendations', icon: Lightbulb },
      { href: '/dashboard/certification',   label: 'Property Certification', icon: Award },
      { href: '/dashboard/alerts',           label: 'Alerts',           icon: Bell },
      { href: '/dashboard/reports',          label: 'Reports',          icon: FileText },
    ],
  },
  {
    label: 'Tools',
    items: [
      { href: '/dashboard/acoustic-scan', label: 'Acoustic Auditor [BETA]', icon: Activity },
      { href: '/dashboard/solar-engine',  label: 'Solar Feasibility', icon: Sun },
      { href: '/dashboard/roi-simulator', label: 'ROI Simulator', icon: Calculator },
    ],
  },
];

export default function DashboardSidebar({ user }) {
  const pathname     = usePathname();
  const router       = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get('upgraded') === 'true') {
      fetch('/api/auth/refresh', { method: 'POST' })
        .then(() => router.replace('/dashboard'))
        .catch(() => {});
    }
  }, [searchParams, router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const isActive = (href) =>
    href === '/dashboard'
      ? pathname === href
      : pathname.startsWith(href);

  return (
    <aside
      className="w-[260px] shrink-0 hidden lg:flex flex-col fixed top-6 left-6 z-40 rounded-3xl"
      style={{
        height: 'calc(100vh - 48px)',
        background: 'rgba(16, 16, 24, 0.50)',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 24px 64px rgba(0,0,0,0.55)',
        overflow: 'hidden', /* clips the ambient glow blob only */
      }}
    >
      {/* Ambient amber top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-28 rounded-full pointer-events-none"
        style={{ background: 'rgba(245,158,11,0.07)', filter: 'blur(32px)' }}
      />

      {/* ── Logo ── */}
      <div className="px-6 py-8 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-tighter">
              OptiCore<span className="text-brand-500">PH</span>
            </h1>
            <p className="text-[9px] font-bold text-brand-400 uppercase tracking-widest">Enterprise</p>
          </div>
        </div>
      </div>

      {/* ── Grouped Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 min-h-0 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {/* Section label */}
            <p className="px-3.5 mb-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-white/20">
              {group.label}
            </p>

            {/* Nav items */}
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={clsx(
                      'group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer relative',
                      active
                        ? 'text-brand-300 font-bold'
                        : 'text-white/40 hover:text-white/75 font-semibold hover:bg-white/[0.04]'
                    )}
                    style={active ? {
                      background: 'linear-gradient(135deg, rgba(245,158,11,0.14) 0%, rgba(245,158,11,0.05) 100%)',
                      border: '1px solid rgba(245,158,11,0.24)',
                      boxShadow: 'inset 0 0 12px rgba(245,158,11,0.05)',
                    } : {}}
                  >
                    {/* Active accent bar */}
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-brand-400" />
                    )}
                    <Icon className={clsx(
                      'w-4 h-4 shrink-0 transition-colors',
                      active ? 'text-brand-400' : 'text-white/25 group-hover:text-white/50'
                    )} />
                    <span className="flex-1">{label}</span>
                    {active && <ChevronRight className="w-3 h-3 text-brand-500/50 shrink-0" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div
        className="px-3 pb-4 pt-3 space-y-2 relative shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.055)' }}
      >
        <PropertySwitcher />

        {/* Plan badge */}
        <div
          className="px-3.5 py-3 rounded-xl space-y-2.5"
          style={{
            background: 'rgba(12,12,18,0.7)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-black mb-0.5">Current Plan</p>
              <p className="text-sm font-bold text-brand-400 capitalize">{user?.plan ?? 'Starter'}</p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-brand-500" />
            </div>
          </div>
          {(!user?.plan || user?.plan === 'starter') && (
            <button
              onClick={async (e) => {
                try {
                  const target = e.currentTarget;
                  const originalHTML = target.innerHTML;
                  target.innerHTML = '<span class="animate-pulse text-[11px]">Loading…</span>';
                  const res = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ plan: 'pro' }),
                  });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                  else target.innerHTML = originalHTML;
                } catch {
                  alert('Error starting checkout');
                }
              }}
              className="w-full text-[11px] font-black uppercase tracking-widest py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#0a0a0f',
                boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
              }}
            >
              <Zap className="w-3 h-3 fill-current" /> Upgrade to Pro
            </button>
          )}
        </div>

        {/* Settings link — replaces old logout-only footer */}
        <Link
          href="/dashboard/settings"
          className={clsx(
            'flex items-center gap-3 px-3.5 py-2.5 rounded-xl w-full text-sm font-bold transition-all duration-150',
            isActive('/dashboard/settings')
              ? 'text-brand-300 bg-brand-500/10 border border-brand-500/20'
              : 'text-white/30 hover:text-white/60 hover:bg-white/[0.04]'
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          Settings
        </Link>

        {/* User info */}
        <div
          className="px-3.5 py-2.5 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p className="text-xs font-bold text-white/80 truncate">{user?.name ?? 'User'}</p>
          <p className="text-[10px] text-white/30 font-medium truncate mt-0.5">{user?.email ?? ''}</p>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl w-full text-sm font-bold text-white/30 hover:text-red-400 hover:bg-red-500/5 transition-all duration-150"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
