"use client";

import { useState, useMemo } from 'react';
import { Search, Activity, ExternalLink, X, Info, Zap, Thermometer, Tag, BatteryCharging, ChevronRight } from 'lucide-react';
import Fuse from 'fuse.js';


interface Appliance {
  id: string;
  brand: string;
  modelNumber: string;
  category: string;
  coolingCapacityKjH: number | null;
  wattage: number | null;
  eerRating: number | null;
  estimatedPricePhp: number | null;
  sourceUrl: string | null;
}

export default function ApplianceCatalogClient({ initialCatalog }: { initialCatalog: Appliance[] }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | "AC" | "Fridge" | "Other">("ALL");
  const [selectedAppliance, setSelectedAppliance] = useState<Appliance | null>(null);

  // Zero-latency local client-side search physics
  const fuse = useMemo(() => {
    return new Fuse(initialCatalog, {
      keys: ['brand', 'modelNumber', 'category'],
      threshold: 0.4,
      distance: 100,
    });
  }, [initialCatalog]);

  const filteredCatalog = useMemo(() => {
    let base = initialCatalog;
    
    if (search.trim()) {
      base = fuse.search(search).map(r => r.item);
    }

    if (selectedCategory !== "ALL") {
      base = base.filter(device => device.category === selectedCategory);
    }

    return base;
  }, [search, selectedCategory, initialCatalog, fuse]);


  return (
    <div className="space-y-8">

      {/* Dynamic Control Surface: Tactical Registry Interface */}
      <div className="flex flex-col xl:flex-row gap-6 items-center justify-between bg-surface-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden group shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 via-transparent to-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center gap-6 w-full xl:w-auto z-10">
          {/* Diagnostic Search field */}
          <div className="relative w-full md:w-80 flex-shrink-0">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-brand-500/50" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 bg-surface-950/50 border border-white/5 rounded-2xl leading-5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all duration-500 sm:text-sm font-medium tracking-wide"
              placeholder="Search hardware registry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Registry Telemetry Metrics */}
          <div className="hidden md:flex items-center gap-8 px-8 border-l border-white/5">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Index Count</span>
              <span className="text-base font-mono font-black text-white">{filteredCatalog.length} <span className="text-text-muted font-sans text-[10px] tracking-normal font-bold">UNITS</span></span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">System Status</span>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                <span className="text-xs font-bold text-emerald-500/80 tracking-tight uppercase">Nominal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tactical Selectors — all schema categories now included */}
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-surface-950/80 border border-white/5 rounded-2xl w-full xl:w-auto z-10 shadow-inner">
          {(["ALL", "AC", "Fridge", "Other"] as const).map(cat => {
            const labels: Record<string, string> = {
              ALL: "All", AC: "Air Con", Fridge: "Fridge", Other: "Other",
            };
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-[10px] font-black tracking-[0.15em] uppercase transition-all duration-500 ease-out border ${selectedCategory === cat
                  ? 'bg-brand-500/10 border-brand-500/50 text-brand-400 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                  : 'text-text-muted border-transparent hover:text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
              >
                {labels[cat]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Rendering Surface */}
      {filteredCatalog.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-surface-900/20 rounded-3xl border border-dashed border-surface-800">
          <Activity className="h-12 w-12 text-surface-600 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-text-secondary hover:text-text-primary">No Hardware Found</h3>
          <p className="text-text-muted mt-2 max-w-sm">We couldn't locate any items matching those exact diagnostic parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredCatalog.map(device => (
            <div
              key={device.id}
              className="relative group flex flex-col bg-surface-900/40 border border-white/5 rounded-2xl overflow-hidden hover:-translate-y-1.5 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(217,119,6,0.15)] hover:border-brand-500/30"
            >
              {/* Premium Glow & Scanline Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/0 via-transparent to-brand-500/0 group-hover:from-brand-500/5 group-hover:to-brand-500/10 transition-colors duration-700 pointer-events-none" />
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,128,0.06))] bg-[length:100%_2px,3px_100%]" />

              {/* Card Header: Glassmorphism / Industrial */}
              <div className="p-5 border-b border-white/5 bg-white/[0.01] backdrop-blur-sm flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                    <p className="text-[10px] font-black tracking-[0.2em] text-brand-500/80 uppercase">{device.brand}</p>
                  </div>
                  <h3 className="text-base font-bold text-text-primary line-clamp-1 leading-tight tracking-tight group-hover:text-white transition-colors" title={device.modelNumber}>
                    {device.modelNumber}
                  </h3>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-surface-950 text-text-secondary border border-white/5 shadow-inner">
                    {device.category}
                  </span>
                </div>
              </div>

              {/* Engineering Specs Matrix */}
              <div className="p-4 space-y-4 flex-grow relative z-10">
                <div className="grid grid-cols-2 gap-3">
                  {/* Price Block */}
                  <div className="bg-surface-950/40 rounded-xl p-3 border border-white/[0.03] space-y-1 group/spec transition-colors hover:border-emerald-500/20">
                    <span className="text-[9px] font-bold text-text-muted tracking-widest uppercase block">Market Price</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-surface-600 text-[10px] font-mono">₱</span>
                      <span className="text-sm font-mono font-black text-emerald-400 tracking-tighter">
                        {device.estimatedPricePhp != null ? device.estimatedPricePhp.toLocaleString() : '—'}
                      </span>
                    </div>
                  </div>

                  {/* EER Block */}
                  <div className="bg-surface-950/40 rounded-xl p-3 border border-white/[0.03] space-y-1 group/spec transition-colors hover:border-brand-500/20">
                    <span className="text-[9px] font-bold text-text-muted tracking-widest uppercase block">
                      {device.category === 'Fridge' ? 'Energy Factor' : 'EER Rating'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-black text-white tracking-tighter">
                        {device.eerRating != null ? device.eerRating.toFixed(2) : '—'}
                      </span>
                      <div className={`h-1.5 flex-1 rounded-full bg-surface-800 overflow-hidden`}>
                        <div
                          className="h-full bg-gradient-to-r from-brand-600 to-brand-400"
                          style={{ width: `${Math.min(((device.eerRating ?? 0) / 20) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Capacity Block */}
                  <div className="bg-surface-950/40 rounded-xl p-3 border border-white/[0.03] space-y-1 group/spec transition-colors hover:border-brand-500/20">
                    <span className="text-[9px] font-bold text-text-muted tracking-widest uppercase block">Cooling Cap.</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-mono font-black text-brand-400 tracking-tighter">
                        {device.coolingCapacityKjH != null ? device.coolingCapacityKjH.toLocaleString() : '—'}
                      </span>
                      <span className="text-surface-600 text-[8px] font-bold uppercase tracking-tighter">kJ/h</span>
                    </div>
                  </div>

                  {/* Wattage Block */}
                  <div className="bg-surface-950/40 rounded-xl p-3 border border-white/[0.03] space-y-1 group/spec transition-colors hover:border-amber-500/20">
                    <span className="text-[9px] font-bold text-text-muted tracking-widest uppercase block">Power Input</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-mono font-black text-amber-400 tracking-tighter">
                        {device.wattage != null ? device.wattage.toFixed(0) : '—'}
                      </span>
                      <span className="text-surface-600 text-[8px] font-bold uppercase tracking-tighter">Watts</span>
                    </div>
                  </div>
                </div>

                {/* Efficiency Tagline */}
                {(device.eerRating ?? 0) > 11 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <Zap className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-tight">High Efficiency Unit Detected</span>
                  </div>
                )}
              </div>

              {/* Footer: Diagnostic Link */}
              <button
                onClick={() => setSelectedAppliance(device)}
                className="w-full py-4 text-center text-[10px] font-bold tracking-[0.2em] text-brand-500/60 hover:text-brand-400 bg-surface-950/30 hover:bg-surface-950/60 border-t border-white/5 transition-all flex items-center justify-center gap-3 relative z-10 group/btn"
              >
                DIAGNOSE PARAMETERS
                <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── DOE Parameter Modal ── */}
      {selectedAppliance && (
        /* Level 1 — fixed overlay with scroll */
        <div className="fixed inset-0 z-[70] overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setSelectedAppliance(null)}
          />
          {/* Level 2 — centering wrapper */}
          <div className="relative min-h-full flex items-center justify-center p-4 py-8">
            {/* Level 3 — modal panel */}
            <div
              className="relative w-full max-w-lg rounded-3xl overflow-hidden flex flex-col"
              style={{
                background: 'rgba(14, 14, 22, 0.95)',
                backdropFilter: 'blur(32px) saturate(180%)',
                WebkitBackdropFilter: 'blur(32px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.10)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 32px 80px rgba(0,0,0,0.7)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                className="p-6 flex justify-between items-start shrink-0"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase"
                      style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}
                    >
                      {selectedAppliance.category}
                    </span>
                    <span className="text-[10px] font-bold text-white/30 tracking-widest uppercase">
                      DOE PELP RECORD
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">{selectedAppliance.modelNumber}</h2>
                  <p className="text-sm text-white/40 font-medium mt-0.5">
                    Manufacturer: <span className="text-white/70">{selectedAppliance.brand}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAppliance(null)}
                  className="p-2 text-white/30 hover:text-white hover:bg-white/[0.06] rounded-full transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {(() => {
                  let labelCap = "Performance";
                  let unitCap  = "Units";
                  let showEER  = (selectedAppliance.eerRating ?? 0) > 0;
                  let labelEER = "EER Rating";

                  switch (selectedAppliance.category) {
                    case "AC":     labelCap = "Cooling Cap."; unitCap = "kJ/h"; break;
                    case "Fridge": labelCap = "Storage Vol."; unitCap = "Liters"; labelEER = "Energy Factor"; break;
                    case "Heater": labelCap = "Max Temp.";   unitCap = "°C"; break;
                    case "Pump":   labelCap = "Flow Rate";   unitCap = "L/min"; break;
                    case "TV":     labelCap = "Screen Size"; unitCap = "Inches"; labelEER = "Energy Star"; break;
                    case "Washer": labelCap = "Load Cap.";   unitCap = "kg"; break;
                  }

                  return (
                    <div className="grid grid-cols-2 gap-4">
                      {/* Cooling capacity */}
                      <div
                        className="rounded-xl p-4 space-y-1"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Thermometer className="w-4 h-4 text-emerald-400" />
                          <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">{labelCap}</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-mono font-black text-white">
                            {selectedAppliance.coolingCapacityKjH != null ? selectedAppliance.coolingCapacityKjH.toLocaleString() : '—'}
                          </span>
                          <span className="text-xs text-white/30 font-bold">{unitCap}</span>
                        </div>
                      </div>

                      {/* Wattage */}
                      <div
                        className="rounded-xl p-4 space-y-1"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-amber-400" />
                          <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">Power Input</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-mono font-black text-white">
                            {selectedAppliance.wattage != null ? selectedAppliance.wattage.toFixed(0) : '—'}
                          </span>
                          <span className="text-xs text-white/30 font-bold">Watts</span>
                        </div>
                      </div>

                      {/* EER */}
                      {showEER ? (
                        <div
                          className="rounded-xl p-4 space-y-1"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <BatteryCharging className="w-4 h-4 text-brand-400" />
                            <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">{labelEER}</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-mono font-black text-white">
                              {selectedAppliance.eerRating != null ? selectedAppliance.eerRating.toFixed(2) : '—'}
                            </span>
                            <span className="text-xs text-white/30 font-bold">Ratio</span>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="rounded-xl p-4 flex flex-col justify-center items-center opacity-40 border-dashed"
                          style={{ border: '1px dashed rgba(255,255,255,0.1)' }}
                        >
                          <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Energy Rating</span>
                          <span className="text-xs text-white/20 font-mono mt-1">N/A</span>
                        </div>
                      )}

                      {/* Price */}
                      <div
                        className="rounded-xl p-4 space-y-1"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="w-4 h-4 text-brand-400" />
                          <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">Market Price</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs text-white/30 font-bold">₱</span>
                          <span className="text-2xl font-mono font-black text-white">
                            {selectedAppliance.estimatedPricePhp != null ? selectedAppliance.estimatedPricePhp.toLocaleString() : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Modal Footer */}
              <div
                className="px-6 py-4 shrink-0"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="text-xs text-white/25 text-center leading-relaxed">
                  OptiCore dynamically extracts these parameters for precision ROI estimation against local Philippine utility providers.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
