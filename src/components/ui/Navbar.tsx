'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { useAuth } from './AuthProvider';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/#solutions', label: 'Solutions' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#calculator', label: 'ROI Calculator' },
  { href: '/#about', label: 'About' },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Scroll shadow
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Don't show public navbar on application pages
  const isAppRoute = ['/customer', '/admin', '/crm', '/partner', '/login', '/signup', '/onboarding'].some(
    (route) => pathname.startsWith(route)
  );
  if (isAppRoute) return null;

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#08080B]/95 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/30'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-150"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              {!loading && (
                user ? (
                  <Link
                    href={
                      user.role === 'customer'
                        ? '/customer'
                        : user.role === 'partner_admin' || user.role === 'partner_agent'
                        ? '/partner'
                        : '/crm'
                    }
                    className="px-4 py-2 text-sm font-medium rounded-xl bg-white/8 hover:bg-white/12 text-white border border-white/10 transition-all"
                  >
                    Dashboard →
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/onboarding"
                      className="px-5 py-2 text-sm font-semibold rounded-xl bg-[#F5A524] text-[#08080B] hover:bg-[#F5A524]/90 transition-all shadow-lg shadow-[#F5A524]/20"
                    >
                      Get Started Free
                    </Link>
                  </>
                )
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-[#0F0F14] border-t border-white/5 px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-white/5 mt-3 space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-center text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors border border-white/10"
              >
                Sign In
              </Link>
              <Link
                href="/onboarding"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-semibold text-center rounded-xl bg-[#F5A524] text-[#08080B] hover:bg-[#F5A524]/90 transition-all"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Spacer for non-hero pages */}
      {pathname !== '/' && <div className="h-16" />}
    </>
  );
}
