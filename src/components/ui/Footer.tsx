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
              The unified utility intelligence platform for Philippine households. Take control of your electric, water, and fuel expenses.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Product</h3>
            <ul className="space-y-3">
              <li><Link href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="#calculator" className="text-sm text-white/60 hover:text-white transition-colors">Savings Calculator</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-sm text-white/60 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-white/60 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><a href="mailto:support@tipidhub.ph" className="text-sm text-white/60 hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} TipidHub (OptiCore PH). All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
