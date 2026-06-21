import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="bg-surface-1000 border-t border-border-subtle py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Logo className="mb-4" />
            <p className="text-sm text-white/60 max-w-xs leading-relaxed">
              Premium Neovolt ESS solar installations tailored for Philippine homes and businesses. Engineering precision from first contact to turnover.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Product</h3>
            <ul className="space-y-3">
              <li><Link href="#calculator" className="text-sm text-white/60 hover:text-white transition-colors">ROI Calculator</Link></li>
              <li><Link href="/billtools" className="text-sm text-white/60 hover:text-white transition-colors">Bill Analytics (Legacy)</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-sm text-white/60 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-white/60 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><a href="mailto:engineering@opticore.ph" className="text-sm text-white/60 hover:text-white transition-colors">Contact Engineering</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} OptiCore Energy Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
