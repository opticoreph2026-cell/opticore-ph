'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calculator,
  Briefcase,
  Package,
  Handshake,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Shield,
  FileText,
} from 'lucide-react';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { Logo } from '@/components/ui/Logo';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  ownerOnly?: boolean;
  badge?: string;
}

const navItems: NavItem[] = [
  { href: '/crm', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/crm/leads', label: 'Leads & Prospects', icon: Users, badge: '' },
  { href: '/crm/quotations', label: 'Quotations', icon: FileText },
  { href: '/crm/designs', label: 'Sizing & ROI Engine', icon: Calculator },
  { href: '/crm/projects', label: 'Active Projects', icon: Briefcase },
  { href: '/crm/inventory', label: 'Inventory', icon: Package, ownerOnly: true },
  { href: '/crm/commissions', label: 'Partner Commissions', icon: Handshake, ownerOnly: true },
];

interface CrmSidebarProps {
  role: string;
  email: string;
  name?: string;
}

function CrmSidebar({ role, email, name }: CrmSidebarProps) {
  const pathname = usePathname();
  const isOwner = role === 'opticore_owner';
  const displayRole = role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const initials = (name || email || 'U').slice(0, 2).toUpperCase();

  return (
    <aside className="w-64 bg-background-900 border-r border-foreground-950/5 flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="h-16 flex items-center px-5 border-b border-foreground-950/5 flex-shrink-0">
        <Logo href="/crm" />
      </div>

      {/* Nav label */}
      <div className="px-4 pt-5 pb-2">
        <p className="text-[10px] font-semibold text-foreground-50/25 uppercase tracking-widest font-mono px-3">
          Operations
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 pb-4">
        {navItems.map((item) => {
          if (item.ownerOnly && !isOwner) return null;
          const isActive = pathname === item.href || (item.href !== '/crm' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-accent-blue/10 text-accent-blue shadow-sm'
                  : 'text-foreground-50/50 hover:text-foreground-50 hover:bg-foreground-950/5'
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive ? 'text-accent-blue' : 'text-foreground-50/40 group-hover:text-foreground-50/70'
                }`}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          );
        })}

        {isOwner && (
          <>
            <div className="pt-4 pb-2">
              <p className="text-[10px] font-semibold text-foreground-50/25 uppercase tracking-widest font-mono px-3">
                Administration
              </p>
            </div>
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                pathname.startsWith('/admin')
                  ? 'bg-accent-rose/10 text-accent-rose'
                  : 'text-foreground-50/50 hover:text-foreground-50 hover:bg-foreground-950/5'
              }`}
            >
              <Shield className="w-4 h-4 flex-shrink-0 text-accent-rose/70" />
              <span>Admin Panel</span>
            </Link>
            <Link
              href="/crm/settings"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                pathname === '/crm/settings'
                  ? 'bg-accent-blue/10 text-accent-blue'
                  : 'text-foreground-50/50 hover:text-foreground-50 hover:bg-foreground-950/5'
              }`}
            >
              <Settings className="w-4 h-4 flex-shrink-0 text-foreground-50/40 group-hover:text-foreground-50/70" />
              <span>System Settings</span>
            </Link>
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-foreground-950/5 flex-shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-foreground-950/5 transition-colors">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-blue to-accent-cyan flex items-center justify-center text-foreground-50 text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground-50 truncate">{name || email}</p>
            <p className="text-[10px] text-foreground-50/40 truncate">{displayRole}</p>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              title="Sign out"
              className="p-1.5 text-foreground-50/30 hover:text-accent-rose transition-colors rounded-lg hover:bg-accent-rose/10"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

export default function CrmSidebarWrapper({
  role,
  email,
  name,
}: CrmSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <CrmSidebar role={role} email={email} name={name} />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0">
            <CrmSidebar role={role} email={email} name={name} />
          </div>
        </div>
      )}

      {/* Mobile topbar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 bg-background-900/95 backdrop-blur border-b border-foreground-950/5">
        <Logo href="/crm" />
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-foreground-50/60 hover:text-foreground-50 rounded-lg hover:bg-foreground-950/5 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>
    </>
  );
}
