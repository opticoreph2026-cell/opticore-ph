'use client';

import { useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import { Search, Info, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';


export default function ApplianceSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dbData, setDbData] = useState([]);
  const [fuseInstance, setFuseInstance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/catalog')
      .then(r => r.json())
      .then(d => {
        const catalog = d.data || [];
        setDbData(catalog);
        setFuseInstance(new Fuse(catalog, {
          keys: ['brand', 'modelNumber', 'category'],
          threshold: 0.4, // More generous matching
          distance: 100,
        }));

      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    const q = e.target.value;
    setQuery(q);
    
    if (q.trim().length > 1 && fuseInstance) {
      const fuzzyResults = fuseInstance.search(q).map(i => i.item).slice(0, 5);
      setResults(fuzzyResults);
      setShowDropdown(true);
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (item) => {
    setQuery(`${item.brand} ${item.modelNumber}`);
    setShowDropdown(false);
    onSelect(item);
  };

  const CATEGORY_ICONS = {
    Fridge: '❄️',
    AC: '🌬️',
    Heater: '🚿',
    Pump: '💧',
    Other: '🔌'
  };

  return (
    <div className="relative w-full z-50">
      <div className={clsx(
        "flex items-center bg-[#111118] border rounded-xl px-4 py-3.5 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.4)]",
        showDropdown ? "border-brand-500/60 ring-1 ring-brand-500/30" : "border-white/10"
      )}>

        <Search className={clsx(
          "w-5 h-5 mr-3 transition-colors pointer-events-none",
          showDropdown ? "text-brand-400" : "text-text-muted"
        )} />
        <input
          type="text"
          className="bg-transparent border-none outline-none w-full text-sm text-text-primary placeholder:text-text-muted/50 font-medium"
          placeholder="Search brand or model (e.g. 'Samsung Inverter')..."
          value={query}
          onChange={handleSearch}
          disabled={loading}
          onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        />
        {loading && <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />}
      </div>


      {showDropdown && (
        <div className="absolute left-0 right-0 z-[500] mt-2 bg-[#1a1a24] border border-brand-500/40 rounded-xl shadow-[0_30px_70px_rgba(0,0,0,0.98)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-3xl ring-1 ring-white/10">

          <div className="p-3 border-b border-white/5 bg-white/[0.03]">
            <span className="text-[10px] uppercase tracking-widest text-[#f59e0b] font-bold px-2">
              Registry Intelligence Matches
            </span>
          </div>


          {results.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto py-1 thin-scrollbar">
              {results.map((item, idx) => (
                <li
                  key={idx}
                  className="px-4 py-3 hover:bg-white/[0.08] cursor-pointer flex items-center justify-between group border-b border-white/[0.02] last:border-0"
                  onClick={() => handleSelect(item)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 flex-shrink-0 flex items-center justify-center text-2xl opacity-90 group-hover:scale-110 transition-transform">
                      {CATEGORY_ICONS[item.category] || CATEGORY_ICONS.other}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors">
                        {item.brand} {item.modelNumber}
                      </span>
                      <span className="text-xs text-text-muted capitalize">
                        {item.category === 'AC' ? 'Air Conditioner' : item.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-semibold text-text-secondary">{item.wattage}W</span>
                    {item.eerRating && <span className="text-[10px] text-text-muted">EER: {item.eerRating.toFixed(1)}</span>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-text-muted flex flex-col items-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />
                  <p>Syncing Registry...</p>
                </>
              ) : (
                <>
                  <Info className="w-5 h-5 opacity-50" />
                  <p>No exact matches found in the active DB catalog.</p>
                  <p className="text-xs">You can still fill in the details manually below.</p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
