'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { useAuth } from './AuthProvider';

export function Navbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  
  // Don't show navbar on dashboard pages as they have their own sidebar/header
  if (pathname.startsWith('/dashboard')) return null;

  return (
    <header className="fixed top-0 w-full z-50 bg-surface-1000/80 backdrop-blur-md border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo />
          
          <nav className="hidden md:flex gap-8">
            <Link href="/billtools" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Bill Analytics (Legacy)</Link>
            <Link href="#calculator" className="text-sm font-medium text-white/60 hover:text-white transition-colors">ROI Calculator</Link>
          </nav>

          <div className="flex items-center gap-4">
            {!loading && (
              user ? (
                <Link href="/dashboard" className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
                    Log in
                  </Link>
                  <Link href="#calculator" className="px-4 py-2 text-sm font-medium rounded-lg bg-[#F5A524] text-[#08080B] hover:bg-[#e0961f] transition-colors">
                    Get a Quote
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
