'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Logo } from './Logo';
import { useAuth } from './AuthProvider';

const footerLinks = {
  Solutions: [
    { label: 'Neovolt ESS Systems', href: '/products' as const },
    { label: 'Solar + Storage Design', href: '/products' as const },
    { label: 'ROI Calculator', href: '/calculator' as const },
    { label: 'Free Site Assessment', href: '/contact' as const },
  ],
  Company: [
    { label: 'About Engr. Julius Rey Gisto', href: '/about' as const },
    { label: 'Partner Network', href: '/about' as const },
    { label: 'Cebu & Visayas Territory', href: '/about' as const },
    { label: 'Bytewatt / Neovolt Products', href: '/products' as const },
  ],
  Support: [
    { label: 'Privacy Policy', href: '/privacy' as const },
    { label: 'Terms of Service', href: '/terms' as const },
    { label: 'Customer Portal', href: '/customer' as const, portal: true },
    { label: 'Partner Portal', href: '/partner' as const, portal: true },
  ],
};

export function Footer() {
  const { user } = useAuth();
  const createPortalLink = (href: string) => {
    if (user) return href;
    return `/login?callbackUrl=${encodeURIComponent(href)}`;
  };

  return (
    <footer className="bg-background-100 border-t border-foreground-950/10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          <div className="md:col-span-2 lg:col-span-2 space-y-5">
            <Logo />
            <p className="text-sm text-foreground-600 max-w-xs leading-relaxed">
              RME-led solar & ESS design, sizing, and installation for
              Cebu, Bohol, and Eastern Visayas. RME-led solar & ESS provider. Featuring Neovolt ESS by Bytewatt.
            </p>
            <div className="space-y-1.5">
              <p className="text-xs text-foreground-500 uppercase tracking-widest font-mono">Contact</p>
              <a
                href="mailto:engineering@opticore.ph"
                className="text-sm text-foreground-500 hover:text-foreground-950 transition-colors block"
              >
                engineering@opticore.ph
              </a>
              <p className="text-sm text-foreground-500">Cebu City, Philippines</p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-500/10 border border-primary-500/20">
              <span className="text-[10px] font-semibold text-primary-500 uppercase tracking-widest">
                Julius Rey S. Gisto, RME · PRC Licensed
              </span>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-semibold text-foreground-950 uppercase tracking-widest mb-5 font-display">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={'portal' in link && link.portal ? createPortalLink(link.href) : link.href}
                      className="text-sm text-foreground-500 hover:text-foreground-950 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}


        </div>

        <div className="mt-16 pt-8 border-t border-foreground-950/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-foreground-500">
            © {new Date().getFullYear()} OptiCore Energy Solutions. All rights reserved. Cebu City, Philippines.
          </p>
          <div className="flex items-center gap-4 text-xs text-foreground-500">
            <span>Featuring Neovolt ESS by Bytewatt</span>
            <span>·</span>
            <span>IEC 61727 · IEC 62116 Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
