import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Zap,
  Package,
  Building2,
  ShieldCheck,
  LogOut,
  ArrowLeft,
  Bell,
  Settings,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { MobileDashboardNav } from '@/components/ui/MobileDashboardNav';

const adminNavItems = [
  { href: '/admin', label: 'System Overview', icon: LayoutDashboard },
  { href: '/admin/clients', label: 'Users & Clients', icon: Users },
  { href: '/admin/providers', label: 'Utility Companies', icon: Zap },
  { href: '/admin/energy/catalog', label: 'Product Catalog', icon: Package },
  { href: '/admin/energy/organizations', label: 'Organizations', icon: Building2 },
  { href: '/admin/energy/rules', label: 'Utility Rates', icon: Zap },
  { href: '/admin/reports', label: 'Reports', icon: ShieldCheck },
  { href: '/admin/alerts', label: 'System Alerts', icon: Bell },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'opticore_owner') {
    redirect('/crm');
  }

  const initials = ((user as any).name || user.email || 'JG').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#08080B] text-white flex">
      <MobileDashboardNav
        navItems={adminNavItems.map(({ label, href }) => ({ label, href }))}
        initials={initials}
        name={(user as any).name}
        email={user.email!}
        displayRole="Owner · Full Access"
        logohref="/admin"
      />

      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0F0F14] hidden md:flex flex-col h-screen sticky top-0">
        {/* Brand */}
        <div className="h-16 flex items-center px-5 border-b border-white/5 flex-shrink-0">
          <Logo href="/admin" />
        </div>

        {/* Admin badge */}
        <div className="px-5 py-3 flex items-center gap-2 bg-[#F43F5E]/5 border-b border-[#F43F5E]/10">
          <ShieldCheck className="w-4 h-4 text-[#F43F5E] flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-[#F43F5E] uppercase tracking-widest">Admin Panel</p>
            <p className="text-[10px] text-white/30">Full system access</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all duration-150 group"
              >
                <Icon className="w-4 h-4 flex-shrink-0 text-white/30 group-hover:text-[#F43F5E] transition-colors" />
                {item.label}
              </Link>
            );
          })}

          <div className="pt-4 mt-2 border-t border-white/5">
            <Link
              href="/crm"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all duration-150 group"
            >
              <ArrowLeft className="w-4 h-4 flex-shrink-0 text-white/30 group-hover:text-[#06B6D4] transition-colors" />
              Back to CRM
            </Link>
          </div>
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F43F5E]/40 to-accent-cyan/40 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {(user as any).name || user.email}
              </p>
              <p className="text-[10px] text-[#F43F5E]/70">Owner · Full Access</p>
            </div>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                title="Sign out"
                className="p-1.5 text-white/30 hover:text-[#F43F5E] transition-colors rounded-lg hover:bg-[#F43F5E]/10"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-x-hidden flex flex-col">
        {/* Top header */}
        <header className="hidden md:flex h-14 items-center justify-between px-8 bg-[#0F0F14]/60 backdrop-blur border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-white/40">
            <ShieldCheck className="w-4 h-4 text-[#F43F5E]" />
            <span>Admin Command Center</span>
          </div>
          <NotificationBell />
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full pt-20 md:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}
