'use client';

import { useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import { Search, Info, Loader2, Zap } from 'lucide-react';
import { clsx } from 'clsx';


export default function ApplianceSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dbData, setDbData] = useState([]);
  const [fuseInstance, setFuseInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

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
        "flex items-center bg-white/[0.02] border rounded-2xl px-5 py-4 transition-all duration-500 shadow-glass-sm",
        showDropdown || isFocused ? "border-cyan-500/50 ring-4 ring-cyan-500/10 bg-white/[0.04]" : "border-white/5"
      )}>
        <Search className={clsx(
          "w-5 h-5 mr-4 transition-colors duration-500 pointer-events-none",
          showDropdown || isFocused ? "text-cyan-400" : "text-slate-500"
        )} />
        <input
          type="text"
          className="bg-transparent border-none outline-none w-full text-base text-white placeholder:text-slate-600 font-medium"
          placeholder="Search by brand or model (e.g. 'Carrier Inverter')..."
          value={query}
          onChange={handleSearch}
          disabled={loading}
          onFocus={() => { 
            setIsFocused(true);
            if (results.length > 0) setShowDropdown(true); 
          }}
          onBlur={() => {
            setIsFocused(false);
            setTimeout(() => setShowDropdown(false), 200);
          }}
        />
        {loading && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin ml-2" />}
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 z-[1000] mt-4 bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-glass-lg overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 ring-1 ring-white/10">
          <div className="px-6 py-4 border-b border-white/5 bg-white/[0.03]">
            <span className="text-[10px] uppercase tracking-[0.25em] text-cyan-400 font-black flex items-center gap-2">
              <Zap className="w-3 h-3" /> Engineering Catalog Match
            </span>
          </div>

          {results.length > 0 ? (
            <ul className="max-h-[400px] overflow-y-auto py-2 thin-scrollbar">
              {results.map((item, idx) => (
                <li
                  key={idx}
                  className="px-6 py-4 hover:bg-white/[0.05] cursor-pointer flex items-center justify-between group transition-all border-b border-white/[0.02] last:border-0"
                  onClick={() => handleSelect(item)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500 shadow-inner-glow-white">
                      {CATEGORY_ICONS[item.category] || '🔌'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors duration-300">
                        {item.brand} {item.modelNumber}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">
                        {item.category === 'AC' ? 'Air Conditioning' : item.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-mono font-bold text-white bg-white/[0.03] px-3 py-1 rounded-lg border border-white/5">
                      {item.wattage}W
                    </span>
                    {item.eerRating > 0 && (
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">
                        EER: {item.eerRating.toFixed(2)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-10 text-center text-sm text-slate-500 flex flex-col items-center gap-4 animate-fade-up">
              {loading ? (
                <>
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  <p className="font-bold uppercase tracking-widest text-xs">Syncing Global Registry...</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center">
                    <Search className="w-6 h-6 opacity-20" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-white font-bold">No exact hardware match</p>
                    <p className="text-xs font-medium max-w-[200px]">We couldn't find this specific model. You can still enter details manually below.</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

