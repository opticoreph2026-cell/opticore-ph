import React from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { canAccessPartnerPortal } from '@/lib/energy-auth';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { Logo } from '@/components/ui/Logo';
import {
  Briefcase,
  Handshake,
  BookOpen,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';

const navItems = [
  { href: '/partner', label: 'My Projects', icon: LayoutDashboard },
  { href: '/partner/commissions', label: 'Commissions & Payouts', icon: Handshake },
  { href: '/partner/resources', label: 'Marketing Resources', icon: BookOpen },
];

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || !canAccessPartnerPortal(session as any)) {
    redirect('/login');
  }

  const email = session.email as string;
  const name = (session as any).name as string | undefined;
  const initials = (name || email || 'P').slice(0, 2).toUpperCase();
  const displayRole = 'Partner Agent';

  return (
    <div className="flex min-h-screen bg-[#08080B] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F0F14] border-r border-white/5 flex flex-col h-screen sticky top-0 hidden md:flex">
        <div className="h-16 flex items-center px-5 border-b border-white/5 flex-shrink-0">
          <Logo />
        </div>

        <div className="px-4 pt-5 pb-2">
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest font-mono px-3">
            Partner Portal
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 pb-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all duration-150 group"
              >
                <Icon className="w-4 h-4 flex-shrink-0 text-white/40 group-hover:text-[#10B981] transition-colors" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-[#10B981]/20 flex items-center justify-center text-[#10B981] text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{name || email}</p>
              <p className="text-[10px] text-[#10B981]/70 truncate">{displayRole}</p>
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

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center justify-between px-6 bg-[#0F0F14]/60 backdrop-blur border-b border-white/5 flex-shrink-0">
          <div className="text-sm text-white/40 font-medium">
            Partner Portal
          </div>
          <NotificationBell />
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
