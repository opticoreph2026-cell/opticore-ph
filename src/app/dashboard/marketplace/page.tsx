'use client';

import React from 'react';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { ShoppingBag, Star, Zap, Wrench, ShieldCheck, ArrowRight } from 'lucide-react';

const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: 'Carrier Optima Inverter 1.0 HP',
    category: 'Air Conditioning',
    price: '₱32,500',
    savings: 'Up to 60% vs non-inverter',
    rating: 4.8,
    imgBg: 'bg-accent-cyan/10',
    icon: <Zap className="w-8 h-8 text-accent-cyan" />
  },
  {
    id: 2,
    name: 'Panasonic Econavi Refrigerator 9.4 cu ft',
    category: 'Refrigeration',
    price: '₱24,999',
    savings: 'Saves ₱450/month on average',
    rating: 4.9,
    imgBg: 'bg-accent-emerald/10',
    icon: <Star className="w-8 h-8 text-accent-emerald" />
  },
  {
    id: 3,
    name: 'LG Smart Inverter Washing Machine 8.5kg',
    category: 'Laundry',
    price: '₱18,990',
    savings: '36% energy savings',
    rating: 4.7,
    imgBg: 'bg-blue-500/10',
    icon: <ShieldCheck className="w-8 h-8 text-blue-400" />
  }
];

const SERVICES = [
  {
    id: 's1',
    name: 'Premium AC Cleaning & Maintenance',
    provider: 'CoolBreeze Tech',
    price: '₱1,200',
    desc: 'Dirty ACs consume 20% more power. Get it cleaned by certified professionals.'
  },
  {
    id: 's2',
    name: 'Residential Solar Consultation',
    provider: 'SolarPH Solutions',
    price: 'Free',
    desc: 'Find out exactly how much you can save by switching to a hybrid solar setup.'
  }
];

export default function MarketplacePage() {
  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col pt-6 pb-20 lg:pb-6 animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-accent-cyan" />
            Energy <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-emerald">Marketplace</span>
          </h1>
          <p className="text-white/60 text-sm mt-2">
            Curated, highly efficient appliances and maintenance services to lower your bills.
          </p>
        </div>
      </div>

      <div className="space-y-10">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-white">Featured High-Efficiency Appliances</h2>
            <button className="text-sm font-medium text-accent-cyan hover:text-accent-cyan/80 transition-colors flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_PRODUCTS.map(product => (
              <SpotlightCard key={product.id} className="p-6 flex flex-col h-full group">
                <div className={`w-full h-40 ${product.imgBg} rounded-xl mb-6 flex items-center justify-center border border-border-subtle group-hover:scale-[1.02] transition-transform`}>
                  {product.icon}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">{product.category}</p>
                  <h3 className="text-lg font-medium text-white mb-2 leading-tight">{product.name}</h3>
                  <div className="flex items-center gap-1 text-accent-emerald text-sm font-medium mb-4">
                    <Zap className="w-4 h-4" /> {product.savings}
                  </div>
                </div>
                <div className="flex items-end justify-between border-t border-border-subtle pt-4 mt-auto">
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Price</p>
                    <p className="text-lg font-bold text-white">{product.price}</p>
                  </div>
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors border border-border-subtle">
                    View Details
                  </button>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-white/60" /> Partner Services
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SERVICES.map(service => (
              <SpotlightCard key={service.id} className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="w-16 h-16 bg-surface-1000 border border-border-subtle rounded-2xl shrink-0 flex items-center justify-center text-accent-emerald">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white">{service.name}</h3>
                  <p className="text-sm text-accent-cyan font-medium mb-2">by {service.provider}</p>
                  <p className="text-sm text-white/60">{service.desc}</p>
                </div>
                <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                  <p className="text-lg font-bold text-white">{service.price}</p>
                  <button className="px-5 py-2.5 bg-gradient-to-r from-accent-cyan to-accent-emerald hover:opacity-90 text-white text-sm font-medium rounded-lg transition-all shadow-lg">
                    Book Now
                  </button>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
