'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard, Users, Zap, CreditCard, BarChart3, HelpCircle, Settings, Bell
} from 'lucide-react';
import Logo from '@/components/ui/Logo';

const navItems = [
  { href: '/dashboard',            label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/dashboard/appliances', label: 'Inventory',     icon: Users },
  { href: '/dashboard/certification', label: 'Certificates',  icon: Zap },
  { href: '/dashboard/roi-simulator', label: 'ROI Simulator', icon: CreditCard },
  { href: '/dashboard/reports',    label: 'Reports',       icon: BarChart3 },
  { href: '/dashboard/alerts',     label: 'Alerts',        icon: Bell },
  { href: '/dashboard/settings',   label: 'Settings',      icon: Settings },
];

export default function DashboardSidebar({ user, isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden animate-in" 
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          "w-[280px] shrink-0 flex flex-col fixed top-0 lg:top-4 left-0 lg:left-4 z-[110] lg:z-40 transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "h-full lg:h-[calc(100vh-32px)] rounded-none lg:rounded-[32px] glass-panel"
        )}
      >
        {/* Logo Section */}
        <div className="px-8 py-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-glass">
            <Logo className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">
              OptiCore
            </h1>
            <p className="text-[10px] font-black text-cyan-400/60 uppercase tracking-[0.2em] leading-none mt-1">
              Management
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'group flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 relative overflow-hidden',
                  active
                    ? 'text-white font-bold bg-white/[0.08] shadow-glass'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                )}
              >
                {/* Active Indicator Glow */}
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent pointer-events-none" />
                )}
                
                <Icon className={clsx(
                  'w-5 h-5 transition-colors duration-300',
                  active ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                )} />
                
                <span className="flex-1 text-[15px] tracking-tight">{label}</span>
                
                {active && (
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Footer (Simplified as per image) */}
        <div className="p-6 mt-auto">
          <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xs font-black text-surface-950">
              {user?.name?.charAt(0) ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name ?? 'Sarah'}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Admin</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
