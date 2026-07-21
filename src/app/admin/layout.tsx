import React from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
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
  TrendingUp,
  HelpCircle,
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
  { href: '/admin/faq', label: 'FAQ Management', icon: HelpCircle },
  { href: '/admin/alerts', label: 'System Alerts', icon: Bell },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

const energyCrmItems = [
  { href: '/admin/energy/leads', label: 'Leads', icon: Users },
  { href: '/admin/energy/customers', label: 'Customers', icon: Users },
  { href: '/admin/energy/quotations', label: 'Quotations', icon: ShieldCheck },
  { href: '/admin/energy/designs', label: 'Designs', icon: Zap },
  { href: '/admin/energy/projects', label: 'Projects', icon: Package },
  { href: '/admin/energy/inventory', label: 'Inventory', icon: Package },
  { href: '/admin/energy/commissions', label: 'Commissions', icon: TrendingUp },
  { href: '/admin/energy/fee-config', label: 'Fee Config', icon: Settings },
  { href: '/admin/energy/packages', label: 'Packages', icon: Package },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'opticore_owner') {
    redirect('/crm');
  }

  const userRecord = await db.client.findUnique({
    where: { id: user.sub },
    select: { suspended: true },
  });
  if (userRecord?.suspended) {
    redirect('/login');
  }

  const initials = ((user as any).name || user.email || 'JG').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background-50 text-foreground-950 flex">
      <MobileDashboardNav
        navItems={adminNavItems.map(({ label, href }) => ({ label, href }))}
        initials={initials}
        name={(user as any).name}
        email={user.email!}
        displayRole="Owner · Full Access"
        logohref="/admin"
      />

      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-foreground-950/5 bg-background-100 hidden md:flex flex-col h-screen sticky top-0">
        {/* Brand */}
        <div className="h-16 flex items-center px-5 border-b border-foreground-950/5 flex-shrink-0">
          <Logo href="/admin" />
        </div>

        {/* Admin badge */}
        <div className="px-5 py-3 flex items-center gap-2 bg-accent-rose/5 border-b border-accent-rose/10">
          <ShieldCheck className="w-4 h-4 text-accent-rose flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-accent-rose uppercase tracking-widest">Admin Panel</p>
            <p className="text-[10px] text-foreground-950/30">Full system access</p>
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
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground-950/50 hover:text-foreground-950 hover:bg-foreground-950/5 transition-all duration-150 group"
              >
                <Icon className="w-4 h-4 flex-shrink-0 text-foreground-950/30 group-hover:text-accent-rose transition-colors" />
                {item.label}
              </Link>
            );
          })}

          <div className="pt-4 mt-2 border-t border-foreground-950/5">
            <p className="px-3 pb-2 text-[10px] font-semibold text-foreground-950/25 uppercase tracking-widest font-mono">
              Energy CRM
            </p>
            {energyCrmItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-foreground-950/50 hover:text-foreground-950 hover:bg-foreground-950/5 transition-all duration-150 group"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 text-foreground-950/30 group-hover:text-accent-cyan transition-colors" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="pt-2 mt-2 border-t border-foreground-950/5">
            <Link
              href="/crm"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground-950/50 hover:text-foreground-950 hover:bg-foreground-950/5 transition-all duration-150 group"
            >
              <ArrowLeft className="w-4 h-4 flex-shrink-0 text-foreground-950/30 group-hover:text-accent-cyan transition-colors" />
              Back to CRM
            </Link>
          </div>
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-foreground-950/5 flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-foreground-950/5 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-rose/40 to-accent-cyan/40 flex items-center justify-center text-foreground-950 text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground-950 truncate">
                {(user as any).name || user.email}
              </p>
              <p className="text-[10px] text-accent-rose/70">Owner · Full Access</p>
            </div>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                title="Sign out"
                className="p-1.5 text-foreground-950/30 hover:text-accent-rose transition-colors rounded-lg hover:bg-accent-rose/10"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="hidden md:flex h-14 items-center justify-between px-8 bg-background-100/60 backdrop-blur border-b border-foreground-950/10 flex-shrink-0 relative z-10">
          <div className="flex items-center gap-2 text-sm text-foreground-950/40">
            <ShieldCheck className="w-4 h-4 text-accent-rose" />
            <span>Admin Command Center</span>
          </div>
          <NotificationBell />
        </header>

        <div className="flex-1 overflow-auto relative">
          <div className="absolute top-0 left-1/3 w-80 h-80 rounded-full bg-accent-rose/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-60 h-60 rounded-full bg-accent-cyan/5 blur-3xl pointer-events-none" />
          <div className="relative p-6 md:p-10 max-w-7xl mx-auto w-full pt-20 md:pt-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
