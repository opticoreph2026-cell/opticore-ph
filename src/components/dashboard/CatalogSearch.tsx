'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Link as LinkIcon, Zap, Loader2, ThermometerSun } from 'lucide-react';
import Fuse from 'fuse.js';
import { clsx } from 'clsx';

/**
 * OptiCore PH - Asset Matchmaker (Catalog Search)
 * 
 * Premium fuzzy-search component for linking real-world appliance specs 
 * to user profiles.
 */
export default function CatalogSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [catalog, setCatalog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  // 1. Fetch Catalog Data
  useEffect(() => {
    async function fetchCatalog() {
      try {
        const res = await fetch('/api/dashboard/catalog');
        const json = await res.json();
        if (json.success) setCatalog(json.data);
      } catch (err) {
        console.error('[CatalogSearch] Fetch failed:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCatalog();
  }, []);

  // 2. Initialize Fuzzy Search (Fuse.js)
  const fuse = useMemo(() => {
    return new Fuse(catalog, {
      keys: ['brand', 'modelNumber', 'category'],
      threshold: 0.35,
      distance: 100,
    });
  }, [catalog]);

  // 3. Perform Search
  const results = useMemo(() => {
    if (!query) return [];
    return fuse.search(query).slice(0, 5); // Show top 5
  }, [fuse, query]);

  return (
    <div className="relative w-full z-[100]">
      {/* ── Search Input ─────────────────────────────────────────────────── */}
      <div className={clsx(
        "flex items-center bg-surface-800 border rounded-lg px-4 py-3 transition-all duration-300",
        isFocused ? "border-amber-500/50 ring-1 ring-amber-500/20" : "border-white/10"
      )}>
        <Search className={clsx(
          "w-5 h-5 mr-3 transition-colors pointer-events-none",
          isFocused ? "text-amber-500" : "text-text-muted"
        )} />
        <input
          type="text"
          placeholder="Search model number (e.g. WCARH009ECV)..."
          className="bg-transparent border-none outline-none w-full text-sm text-text-primary placeholder:text-text-muted/60"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />
        {isLoading && <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />}
      </div>

      {/* ── Results Dropdown ──────────────────────────────────────────────── */}
      {results.length > 0 && isFocused && (
        <div className="absolute top-full left-0 w-full mt-2 bg-[#1a1a24] border border-amber-500/30 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[110] backdrop-blur-xl">
          <div className="p-3 border-b border-white/5 bg-white/[0.03]">
            <span className="text-[10px] uppercase tracking-widest text-[#f59e0b] font-bold px-2">
              Engineering Catalog Matches
            </span>
          </div>
          
          <ul className="divide-y divide-white/5 max-h-[300px] overflow-y-auto thin-scrollbar pb-16">
            {results.map(({ item }) => (
              <li 
                key={item.id}
                className="group flex items-center justify-between p-4 hover:bg-white/[0.05] transition-colors cursor-pointer"
                onClick={() => onSelect?.(item)}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded bg-amber-500/10 flex items-center justify-center mr-4 border border-amber-500/20">
                    {item.category === 'AC' ? (
                      <ThermometerSun className="w-5 h-5 text-amber-500" />
                    ) : (
                      <Zap className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                        {item.brand} {item.modelNumber}
                      </span>
                      <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-text-muted uppercase tracking-tighter border border-white/5">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-text-muted font-mono uppercase tracking-tight">
                      <span className="text-amber-500/80">{item.wattage ? Number(item.wattage).toFixed(2) : '0.00'}W</span>
                      {item.eerRating > 0 && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="text-emerald-400/80">{Number(item.eerRating).toFixed(2)} EER</span>
                        </>
                      )}
                      {item.coolingCapacityKjH > 0 && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="text-blue-400/80">{Number(item.coolingCapacityKjH).toFixed(2)} kJ/h</span>
                        </>
                      )}
                      {item.estimatedPricePhp > 0 && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="text-text-primary">₱{Number(item.estimatedPricePhp).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <button 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500 text-white hover:text-surface-950 transition-all border border-amber-500/20"
                  title="Link to My Profile"
                >
                  <LinkIcon className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-tight">Link</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Empty State ──────────────────────────────────────────────────── */}
      {query.length > 2 && results.length === 0 && isFocused && (
        <div className="absolute top-full left-0 w-full mt-2 bg-[#1a1a24] border border-white/10 rounded-xl p-8 text-center animate-in fade-in duration-200 z-[110] shadow-2xl">
          <p className="text-sm text-text-primary">No exact match in our engineering database.</p>
          <p className="text-[10px] text-text-muted/70 uppercase mt-2">Try searching by brand (e.g. Carrier)</p>
        </div>
      )}
    </div>
  );
}
