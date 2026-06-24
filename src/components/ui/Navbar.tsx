'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { Logo } from './Logo';
import { useAuth } from './AuthProvider';
import { LocaleSwitcher } from './LocaleSwitcher';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/products' as const, label: t('products') },
    { href: '/calculator' as const, label: t('calculator') },
    { href: '/about' as const, label: t('about') },
    { href: '/contact' as const, label: t('contact') },
  ];

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isAppRoute = ['/customer', '/admin', '/crm', '/partner', '/login', '/signup', '/onboarding'].some(
    (route) => pathname.startsWith(route),
  );
  if (isAppRoute) return null;

  const dashboardHref =
    user?.role === 'customer'
      ? '/customer'
      : user?.role === 'partner_admin' || user?.role === 'partner_installer'
        ? '/partner'
        : '/crm';

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
          <div className="flex justify-between items-center h-20">
            <Logo />

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-base font-medium text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-150"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <LocaleSwitcher />
              {!loading &&
                (user ? (
                  <Link
                    href={dashboardHref}
                    className="px-4 py-2 text-base font-medium rounded-xl bg-white/8 hover:bg-white/12 text-white border border-white/10 transition-all"
                  >
                    {t('dashboard')} →
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-2 text-base font-medium text-white/70 hover:text-white transition-colors"
                    >
                      {t('signIn')}
                    </Link>
                    <Link
                      href="/contact"
                      className="px-5 py-2 text-base font-semibold rounded-xl bg-accent-blue text-white hover:bg-accent-blue/90 transition-all shadow-lg shadow-accent-blue/20"
                    >
                      {t('getQuote')}
                    </Link>
                  </>
                ))}
            </div>

            <div className="md:hidden flex items-center gap-2">
              <LocaleSwitcher />
              <button
                className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

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
                {t('signIn')}
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-semibold text-center rounded-xl bg-accent-blue text-white hover:bg-accent-blue/90 transition-all"
              >
                {t('getQuote')}
              </Link>
            </div>
          </div>
        )}
      </header>

      {pathname !== '/' && <div className="h-20" />}
    </>
  );
}
