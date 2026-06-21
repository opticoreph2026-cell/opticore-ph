'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { useAuth } from './AuthProvider';

export function Navbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  
  // Don't show public navbar on application pages
  const isAppRoute = ['/customer', '/admin', '/crm', '/partner'].some(route => pathname.startsWith(route));
  if (isAppRoute) return null;

  return (
    <header className="fixed top-0 w-full z-50 bg-[#08080B]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo />
          
          <nav className="hidden md:flex gap-8">
            <Link href="#calculator" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Calculate ROI</Link>
          </nav>

          <div className="flex items-center gap-4">
            {!loading && (
              user ? (
                <Link href={user.role === 'customer' ? '/customer' : '/crm'} className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                    Log in
                  </Link>
                  <Link href="/onboarding" className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-gray-200 transition-colors">
                    Get Started
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
