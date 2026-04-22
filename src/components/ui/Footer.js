import Link from 'next/link';
import { Zap, Github, Mail, Facebook } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/[0.06] bg-surface-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-brand-400" />
              </div>
              <span className="font-semibold text-sm">
                <span className="shimmer-text">OptiCore</span>
                <span className="text-text-secondary ml-0.5">PH</span>
              </span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed max-w-xs">
              AI-powered utility bill optimization for every Filipino household and business.
              Works with any electricity or water provider nationwide.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">Product</p>
            <ul className="space-y-2.5">
              {[
                { href: '/#how-it-works', label: 'How It Works' },
                { href: '/pricing',       label: 'Pricing' },
                { href: '/login',         label: 'Sign In' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-text-muted hover:text-text-secondary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">Legal</p>
            <ul className="space-y-2.5">
              {[
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-text-muted hover:text-text-secondary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            © {year} OptiCore PH. All rights reserved. PDPA 2012 compliant.
          </p>
          <div className="flex items-center gap-4 text-text-muted">
            <a href="mailto:opticoreph2026@gmail.com" className="hover:text-text-primary transition-colors">
              <Mail className="w-4 h-4" />
              <span className="sr-only">Contact</span>
            </a>
            <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors">
              <Github className="w-4 h-4" />
              <span className="sr-only">GitHub</span>
            </a>
            <a href="https://facebook.com/opticoreph" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors">
              <Facebook className="w-4 h-4" />
              <span className="sr-only">Facebook</span>
            </a>
          </div>
          <p className="text-xs text-text-muted hidden sm:block">
            Built for the Philippines 🇵🇭
          </p>
        </div>
      </div>
    </footer>
  );
}
