'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';
import { Logo } from './Logo';
import { NotificationBell } from './NotificationBell';

interface MobileNavItem {
  href: string;
  label: string;
}

interface MobileDashboardNavProps {
  navItems: MobileNavItem[];
  initials: string;
  name?: string;
  email: string;
  displayRole: string;
}

export function MobileDashboardNav({
  navItems,
  initials,
  name,
  email,
  displayRole,
}: MobileDashboardNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile topbar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 bg-[#0F0F14]/95 backdrop-blur border-b border-white/5">
        <Logo />
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-[#0F0F14] border-r border-white/5 flex flex-col">
            <div className="h-14 flex items-center px-5 border-b border-white/5 flex-shrink-0">
              <Logo />
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 border-t border-white/5 flex-shrink-0">
              <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{name || email}</p>
                  <p className="text-[10px] text-white/50 truncate">{displayRole}</p>
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
          </div>
        </div>
      )}
    </>
  );
}
