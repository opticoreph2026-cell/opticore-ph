'use client';

import { useEffect, useState } from 'react';
import { Zap, Droplets } from 'lucide-react';
import Image from 'next/image';

export default function ProviderMarquee() {
  const [providers, setProviders] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard/providers')
      .then(r => r.json())
      .then(d => {
        if (d.providers?.length > 0) {
          setProviders(d.providers);
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  // Fallback static list if no providers loaded yet
  const FALLBACK = [
    'Meralco', 'VECO', 'Davao Light', 'Cebu Light',
    'MCWD', 'Manila Water', 'Maynilad', 'DLPC',
    'MORE Power', 'BENECO', 'BASELCO',
  ];

  // We double the array for seamless infinite scrolling
  const items = providers.length > 0 ? [...providers, ...providers] : [...FALLBACK, ...FALLBACK];

  return (
    <section className="py-10 border-t border-white/[0.06] bg-surface-900/50 overflow-hidden relative flex items-center">
      {/* Fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-surface-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-surface-950 to-transparent z-10 pointer-events-none" />

      <div className="flex gap-10 animate-marquee whitespace-nowrap items-center w-max">
        {items.map((item, i) => {
          const isObj = typeof item === 'object';
          const name = isObj ? item.name : item;
          const logoUrl = isObj ? item.logoUrl : null;
          const website = isObj ? item.website : null;
          const isElectric = isObj ? item.type === 'electricity' : true;

          const inner = (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-surface-800/50 border border-white/[0.05] hover:border-brand-500/20 hover:bg-surface-800 transition-all duration-300 group cursor-default"
            >
              {/* Logo or icon */}
              <div className="w-7 h-7 rounded-md overflow-hidden flex items-center justify-center shrink-0 bg-white/5">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={`${name} logo`}
                    width={28}
                    height={28}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                ) : (
                  isElectric
                    ? <Zap className="w-3.5 h-3.5 text-brand-500/60 group-hover:text-brand-400 transition-colors" />
                    : <Droplets className="w-3.5 h-3.5 text-blue-500/60 group-hover:text-blue-400 transition-colors" />
                )}
              </div>
              <span className="text-sm font-semibold text-text-muted group-hover:text-text-secondary transition-colors">
                {name}
              </span>
            </div>
          );

          return website ? (
            <a key={i} href={website} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
              {inner}
            </a>
          ) : (
            <div key={i}>{inner}</div>
          );
        })}
      </div>
    </section>
  );
}
