import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { canAccessCustomerPortal } from '@/lib/energy-auth';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { Logo } from '@/components/ui/Logo';
import { MobileDashboardNav } from '@/components/ui/MobileDashboardNav';
import {
  Sun,
  FileText,
  Wrench,
  LogOut,
  LayoutDashboard,
  Settings,
} from 'lucide-react';

const navItems = [
  { href: '/customer', label: 'My System', icon: LayoutDashboard },
  { href: '/customer/documents', label: 'Documents & Manuals', icon: FileText },
  { href: '/customer/support', label: 'Support & Maintenance', icon: Wrench },
  { href: '/customer/settings', label: 'Settings', icon: Settings },
];

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || !canAccessCustomerPortal(session as any)) {
    redirect('/login');
  }

  const userRecord = await db.client.findUnique({
    where: { id: session.sub },
    select: { suspended: true, lastSignedInAt: true },
  });
  if (userRecord?.suspended) {
    redirect('/login');
  }

  const email = session.email as string;
  const name = (session as any).name as string | undefined;
  const initials = (name || email || 'C').slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen bg-background-50 text-foreground-950">
      <MobileDashboardNav
        navItems={navItems.map(({ label, href }) => ({ label, href }))}
        initials={initials}
        name={name}
        email={email}
        displayRole="Customer"
        logohref="/customer"
      />

      {/* Sidebar */}
      <aside className="w-64 bg-background-100 border-r border-foreground-950/5 flex flex-col h-screen sticky top-0 hidden md:flex">
        <div className="h-16 flex items-center px-5 border-b border-foreground-950/5 flex-shrink-0">
          <Logo href="/customer" />
        </div>

        <div className="px-4 pt-5 pb-2">
          <p className="text-[10px] font-semibold text-foreground-950/25 uppercase tracking-widest font-mono px-3">
            Customer Portal
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 pb-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground-950/50 hover:text-foreground-950 hover:bg-foreground-950/5 transition-all duration-150 group"
              >
                <Icon className="w-4 h-4 flex-shrink-0 text-foreground-950/40 group-hover:text-accent-cyan transition-colors" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-foreground-950/5 flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-foreground-950/5 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-accent-cyan/20 flex items-center justify-center text-accent-cyan text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground-950 truncate">{name || email}</p>
              <p className="text-[10px] text-accent-cyan/70 truncate">Customer</p>
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

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex h-14 items-center justify-between px-6 bg-background-100/60 backdrop-blur border-b border-foreground-950/5 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-foreground-950/40">
              <Sun className="w-4 h-4 text-accent-cyan" />
            <span className="font-medium">My OptiCore System</span>
          </div>
          <NotificationBell />
        </header>

        <div className="flex-1 overflow-auto relative">
          <div className="absolute top-0 left-1/3 w-72 h-72 rounded-full bg-accent-cyan/5 blur-3xl pointer-events-none" />
          <div className="relative p-6 md:p-8 pt-20 md:pt-6 max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
