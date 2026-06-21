import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';

const footerLinks = {
  Solutions: [
    { label: 'Neovolt ESS Systems', href: '/#solutions' },
    { label: 'Solar + Storage Design', href: '/#solutions' },
    { label: 'ROI Calculator', href: '/#calculator' },
    { label: 'Net Metering Guide', href: '/#how-it-works' },
  ],
  Company: [
    { label: 'About Julius Gisto, RME', href: '/#about' },
    { label: 'Partner Network', href: '/#about' },
    { label: 'Cebu & Visayas Territory', href: '/#about' },
    { label: 'Bytewatt / Neovolt Products', href: '/#solutions' },
  ],
  Support: [
    { label: 'Customer Portal', href: '/customer' },
    { label: 'Partner Portal', href: '/partner' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#08080B] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="md:col-span-2 space-y-5">
            <Logo />
            <p className="text-sm text-white/40 max-w-xs leading-relaxed">
              Licensed-engineer-led solar & ESS design, sizing, and installation for
              Cebu, Bohol, and Eastern Visayas. Authorized Neovolt installer-partner.
            </p>
            <div className="space-y-1.5">
              <p className="text-xs text-white/25 uppercase tracking-widest font-mono">Contact</p>
              <a
                href="mailto:engineering@opticore.ph"
                className="text-sm text-white/50 hover:text-white transition-colors block"
              >
                engineering@opticore.ph
              </a>
              <p className="text-sm text-white/40">Cebu City, Philippines</p>
            </div>
            {/* Credentials badge */}
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F5A524]/8 border border-[#F5A524]/15">
              <span className="text-[10px] font-semibold text-[#F5A524] uppercase tracking-widest">
                Julius Rey S. Gisto, RME · PRC Licensed
              </span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-semibold text-white uppercase tracking-widest mb-5 font-display">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/40 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} OptiCore Energy Solutions. All rights reserved. DTI-registered, Cebu City, Philippines.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/25">
            <span>Powered by Neovolt ESS by Bytewatt</span>
            <span>·</span>
            <span>IEC 61727 · IEC 62116 Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
