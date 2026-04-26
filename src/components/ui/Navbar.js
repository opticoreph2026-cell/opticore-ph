'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Logo from '@/components/ui/Logo';

const NAV_LINKS = [
  { href: '/#how-it-works', label: 'How It Works', match: '/' },
  { href: '/pricing',       label: 'Pricing',      match: '/pricing' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 group">
            <Logo className="w-10 h-10" />
            <div className="flex flex-col">
              <span className="text-lg font-black text-white tracking-tighter leading-none group-hover:text-brand-400 transition-colors">
                OptiCore <span className="text-brand-500">PH</span>
              </span>
              <span className="text-[8px] font-black text-text-faint uppercase tracking-[0.2em] mt-0.5">Intelligent to the CORE</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, match }) => {
              const isActive = pathname === match;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-4 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'text-brand-400 bg-brand-500/5'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
                  }`}
                >
                  {label}
                  {/* Active indicator underline */}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-brand-500" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm px-4 py-2">
              Sign in
            </Link>
            <Link href="/pricing" className="btn-primary text-sm px-4 py-2">
              Get Started
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-colors"
            onClick={() => setOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/[0.06] bg-surface-900/95 backdrop-blur animate-slide-down origin-top">
          <div className="px-4 py-4 space-y-1">
            {[
              ...NAV_LINKS,
              { href: '/login', label: 'Sign in', match: '/login' },
            ].map(({ href, label, match }) => {
              const isActive = pathname === match;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`block px-4 py-2.5 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'text-brand-400 bg-brand-500/5'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              );
            })}
            <Link
              href="/pricing"
              className="btn-primary w-full text-sm mt-2"
              onClick={() => setOpen(false)}
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

