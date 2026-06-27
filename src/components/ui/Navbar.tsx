'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { Logo } from './Logo';
import { LocaleSwitcher } from './LocaleSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
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

  const isAppRoute = ['/customer', '/admin', '/crm', '/partner', '/login', '/signup', '/onboarding', '/dashboard'].some(
    (route) => pathname.startsWith(route),
  );
  if (isAppRoute) return null;

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background-50/90 backdrop-blur-xl border-b border-foreground-950/10 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Logo />

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 text-base font-medium rounded-lg transition-all duration-150 ${
                      isActive
                        ? 'text-primary-500 bg-primary-500/10'
                        : 'text-foreground-600 hover:text-foreground-950 hover:bg-background-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden md:flex items-center gap-2">
              <LocaleSwitcher />
              <ThemeToggle />
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-base font-medium text-foreground-600 hover:text-foreground-950 transition-colors"
                >
                  {t('signIn')}
                </Link>
                <Link
                  href="/contact"
                  className="px-5 py-2 text-base font-semibold rounded-xl bg-primary-500 text-background-50 hover:bg-primary-600 transition-all shadow-lg btn-icon"
                >
                  {t('getQuote')}
                </Link>
              </>
            </div>

            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <button
                className="p-2 text-foreground-600 hover:text-foreground-950 rounded-lg hover:bg-background-100 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="md:hidden bg-background-50 border-t border-foreground-950/10 px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto"
            >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                  pathname === link.href
                    ? 'text-primary-500 bg-primary-500/10'
                    : 'text-foreground-600 hover:text-foreground-950 hover:bg-background-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 pt-3 border-t border-foreground-950/10 mt-3">
              <LocaleSwitcher />
            </div>
            <div className="space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-center text-foreground-600 hover:text-foreground-950 hover:bg-background-100 rounded-xl transition-colors border border-foreground-950/10"
              >
                {t('signIn')}
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-semibold text-center rounded-xl bg-primary-500 text-background-50 hover:bg-primary-600 transition-all"
              >
                {t('getQuote')}
              </Link>
            </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {pathname !== '/' && <div className="h-20" />}
    </>
  );
}
