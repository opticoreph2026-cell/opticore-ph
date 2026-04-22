'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import {
  Zap, BarChart3, Users, FileText, Bell, LogOut, ChevronRight, Shield, Database, LayoutDashboard
} from 'lucide-react';

const navItems = [
  { href: '/admin',          label: 'KPI Dashboard', icon: LayoutDashboard, color: 'text-blue-400' },
  { href: '/admin/clients',  label: 'Clients',       icon: Users,           color: 'text-emerald-400' },
  { href: '/admin/providers', label: 'Providers',     icon: Database,        color: 'text-amber-400' },
  { href: '/admin/reports',  label: 'Reports',       icon: FileText,        color: 'text-purple-400' },
  { href: '/admin/alerts',   label: 'Alerts',        icon: Bell,            color: 'text-red-400' },
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
    <aside className="w-64 shrink-0 hidden lg:flex flex-col h-screen sticky top-0 border-r border-white/[0.08] bg-surface-950/80 backdrop-blur-xl">
      {/* Logo Section */}
      <div className="px-6 py-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 bg-brand-500/20 blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 border border-brand-500/30 flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-brand-400" />
            </div>
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white block">OptiCore <span className="text-brand-400">PH</span></span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.15em]">Admin Portal</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
        <div className="px-4 mb-4">
          <span className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em]">Management</span>
        </div>
        
        {navItems.map(({ href, label, icon: Icon, color }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group',
                active 
                  ? 'bg-white/[0.06] text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]' 
                  : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
              )}
            >
              {active && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-brand-500 rounded-r-full shadow-[0_0_15px_rgba(var(--brand-500),0.5)]"
                />
              )}
              
              <Icon className={clsx('w-4.5 h-4.5 transition-transform group-hover:scale-110', active ? color : 'text-current')} />
              <span className="text-sm font-medium tracking-tight">{label}</span>
              
              {active && (
                <motion.div 
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-auto"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                </motion.div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Sign Out */}
      <div className="p-4 mt-auto">
        <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.05]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-red-400/20 transition-colors">
              <LogOut className="w-4 h-4" />
            </div>
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
