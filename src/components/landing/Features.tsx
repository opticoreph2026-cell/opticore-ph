import React from 'react';
import { SpotlightCard } from '../ui/SpotlightCard';

const features = [
  {
    title: 'AI Bill Scanner',
    description: 'Stop manual data entry. Take a photo of your Meralco or Maynilad bill, and our AI automatically extracts consumption, amounts, and dates with 99% accuracy.',
    icon: (
      <svg className="w-6 h-6 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'ERC Rate Verification',
    description: 'We connect directly to official ERC and MWSS databases to verify you are not being overcharged. We calculate your expected bill down to the last centavo.',
    icon: (
      <svg className="w-6 h-6 text-accent-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Appliance Level Tracking',
    description: 'Discover the "ghost loads" in your house. Tell us your appliances, and we will show you exactly what is driving your bill up.',
    icon: (
      <svg className="w-6 h-6 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Fuel & LPG Logs',
    description: 'Track your generator fuel, vehicle diesel, and cooking LPG in one unified dashboard to see your true total energy cost.',
    icon: (
      <svg className="w-6 h-6 text-accent-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-surface-1000 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-semibold text-accent-cyan tracking-wider uppercase mb-3">Core Features</h2>
          <p className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Everything you need to master your bills
          </p>
          <p className="text-lg text-white/60">
            TipidHub gives you unprecedented visibility into your utility expenses with enterprise-grade analytics built for the home.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <SpotlightCard key={idx} className="p-8 h-full flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed flex-1">
                {feature.description}
              </p>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}
