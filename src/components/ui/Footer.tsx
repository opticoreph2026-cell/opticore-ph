import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="bg-[#08080B] border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Logo className="mb-6" />
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed font-body">
              OptiCore PH is the premier Solar &amp; ESS intelligence platform designed for the Philippine market. We turn your energy bills into assets through precision engineering and data-driven insights.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white mb-6 uppercase tracking-wider font-display">Platform</h3>
            <ul className="space-y-4">
              <li><Link href="#calculator" className="text-sm text-gray-400 hover:text-white transition-colors">ROI Calculator</Link></li>
              <li><Link href="/onboarding" className="text-sm text-gray-400 hover:text-white transition-colors">Load Assessment</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-6 uppercase tracking-wider font-display">Legal</h3>
            <ul className="space-y-4">
              <li><Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><a href="mailto:engineering@opticore.ph" className="text-sm text-gray-400 hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 font-body">
            &copy; {new Date().getFullYear()} OptiCore Energy Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
