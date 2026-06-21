import React from 'react';
import Link from 'next/link';

const tiers = [
  {
    name: 'Free',
    price: '₱0',
    description: 'Perfect for tracking a single property.',
    features: [
      '1 Property limit',
      'Basic electricity tracking',
      'Manual bill entry',
      'Standard ERC rates',
    ],
    cta: 'Start Free',
    href: '/signup',
    popular: false,
  },
  {
    name: 'Pro',
    price: '₱149',
    interval: '/mo',
    description: 'Full intelligence for the modern household.',
    features: [
      'Up to 3 Properties',
      'AI Bill Scanning (OCR)',
      'Electricity, Water, & Fuel',
      'Appliance level tracking',
      'Custom rate alerts',
    ],
    cta: 'Upgrade to Pro',
    href: '/signup?plan=pro',
    popular: true,
  },
  {
    name: 'Business',
    price: '₱799',
    interval: '/mo',
    description: 'For property managers and SMEs.',
    features: [
      'Unlimited Properties',
      'Priority AI Scanning',
      'Export to CSV/Excel',
      'API Access',
      'Dedicated Account Manager',
    ],
    cta: 'Contact Sales',
    href: 'mailto:sales@OptiCore.ph',
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-surface-1000">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-semibold text-accent-cyan tracking-wider uppercase mb-3">Pricing</h2>
          <p className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Simple, transparent pricing
          </p>
          <p className="text-lg text-white/60">
            Choose the plan that fits your needs. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, idx) => (
            <div 
              key={idx} 
              className={`relative flex flex-col p-8 rounded-2xl border ${
                tier.popular 
                  ? 'bg-surface-900 border-accent-cyan shadow-2xl shadow-accent-cyan/10 scale-105 z-10' 
                  : 'bg-surface-900/50 border-border-subtle hover:border-white/10'
              } transition-all duration-300`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-gradient-to-r from-accent-cyan to-accent-emerald text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-2">{tier.name}</h3>
                <p className="text-sm text-white/60 min-h-[40px]">{tier.description}</p>
              </div>
              
              <div className="mb-8 flex items-baseline text-white">
                <span className="text-4xl font-display font-bold tracking-tight">{tier.price}</span>
                {tier.interval && <span className="text-sm text-white/40 ml-1 font-medium">{tier.interval}</span>}
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <svg className={`w-5 h-5 mr-3 shrink-0 ${tier.popular ? 'text-accent-cyan' : 'text-white/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link 
                href={tier.href}
                className={`w-full py-3 px-4 rounded-xl text-center text-sm font-semibold transition-all ${
                  tier.popular
                    ? 'bg-gradient-to-r from-accent-cyan to-accent-emerald text-white hover:opacity-90 shadow-lg'
                    : 'bg-white/5 text-white hover:bg-white/10 border border-border-subtle'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
