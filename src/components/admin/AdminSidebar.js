'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import {
  Zap, BarChart3, Users, FileText, Bell, LogOut, ChevronRight, Shield, Database
} from 'lucide-react';

const navItems = [
  { href: '/admin',          label: 'KPI Dashboard', icon: BarChart3 },
  { href: '/admin/clients',  label: 'Clients',       icon: Users },
  { href: '/admin/providers', label: 'Providers',     icon: Database },
  { href: '/admin/reports',  label: 'Reports',       icon: FileText },
  { href: '/admin/alerts',   label: 'Alerts',        icon: Bell },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col h-screen sticky top-0 border-r border-white/[0.06] bg-surface-900">
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
            <Zap className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <span className="font-semibold text-sm shimmer-text">OptiCore PH</span>
            <div className="flex items-center gap-1 mt-0.5">
              <Shield className="w-3 h-3 text-brand-500" />
              <span className="text-[10px] text-brand-500 font-medium tracking-wide">ADMIN</span>
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-4 mb-3 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
          Admin Panel
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx('nav-item', active && 'active')}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
              {active && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/[0.06]">
        <button
          onClick={handleLogout}
          className="nav-item w-full text-text-muted hover:text-red-400 hover:bg-red-500/5"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
