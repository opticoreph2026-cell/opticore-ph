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

export default function DashboardSidebar({ user, isOpen, onClose }) {
  const pathname     = usePathname();
  const router       = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

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
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden animate-in fade-in duration-300" 
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          "w-[260px] shrink-0 flex flex-col fixed top-0 lg:top-6 left-0 lg:left-6 z-[110] lg:z-40 transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "h-full lg:h-[calc(100vh-48px)] rounded-none lg:rounded-3xl"
        )}
        style={{
          background: 'rgba(16, 16, 24, 0.95)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          borderRight: '1px solid rgba(255,255,255,0.09)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 24px 64px rgba(0,0,0,0.55)',
        }}
      >
      {/* Background Glow Container (Clipped) */}
      <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-28 rounded-full"
          style={{ background: 'rgba(245,158,11,0.07)', filter: 'blur(32px)' }}
        />
      </div>

      {/* ── Logo ── */}
      <div className="px-6 py-8 border-b border-white/[0.04] relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 overflow-hidden">
             <Logo className="w-7 h-7" />
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
        className="px-3 pb-6 pt-3 space-y-2 relative shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.055)' }}
      >
        {/* Plan badge - Clean version */}
        <div
          className="px-3.5 py-3 rounded-2xl flex items-center justify-between"
          style={{
            background: 'rgba(12,12,18,0.7)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div>
            <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-black mb-0.5">Plan</p>
            <p className="text-xs font-bold text-brand-400 capitalize">{user?.plan ?? 'Starter'}</p>
          </div>
          <div className="w-6 h-6 rounded-lg bg-brand-500/10 flex items-center justify-center">
            <Zap className="w-3 h-3 text-brand-500" />
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
