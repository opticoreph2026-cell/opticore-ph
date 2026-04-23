'use client';

import { Edit, Trash, Zap, Clock, Calculator } from 'lucide-react';

const CATEGORY_ICONS = {
  refrigerator: '❄️',
  aircon: '🌬️',
  washing_machine: '🫧',
  water_heater: '🚿',
  electric_fan: '🎐',
  tv: '📺',
  rice_cooker: '🍚',
  water_dispenser: '🚰',
  iron: '🎽',
  microwave: '🥘',
  electric_stove: '🍳',
  other: '🔌'
};

export default function ApplianceCard({ appliance, onEdit, onDelete, rate = 12 }) {
  const f = appliance;
  const quantity = f.quantity || 1;
  
  // Calculate total monthly kWh considering quantity
  const estimatedMonthlyKwh = f.wattage && f.hoursPerDay 
    ? ((f.wattage * f.hoursPerDay * 30 * quantity) / 1000).toFixed(1) 
    : null;
    
  // Monthly cost estimation
  const estimatedMonthlyCost = estimatedMonthlyKwh
    ? (estimatedMonthlyKwh * rate).toFixed(0)
    : null;

  return (
    <div className="bento-card p-6 flex flex-col relative group gap-5 transition-all duration-300 hover:-translate-y-1" style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 32px rgba(0,0,0,0.3)', background: 'linear-gradient(135deg, rgba(30, 30, 42, 0.7) 0%, rgba(20, 20, 30, 0.5) 100%)' }}>

      <div className="absolute inset-0 bg-amber-glow opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[inherit]"></div>
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-brand-500/0 group-hover:via-brand-500/20 to-transparent transition-all duration-500"></div>
      <div className="flex items-start justify-between gap-2 relative z-10">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative group/icon shrink-0">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-xl shadow-lg shadow-brand-500/5">
              {CATEGORY_ICONS[f.category] || CATEGORY_ICONS.other}
            </div>
            {quantity > 1 && (
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-brand-500 text-[10px] font-bold text-surface-950 flex items-center justify-center border-2 border-surface-900 animate-fade-down ring-1 ring-brand-500/50">
                {quantity}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 pr-8">

            <h3 className="font-semibold text-text-primary text-sm truncate w-full" title={f.name || `${f.brand} ${f.model}`}>
              {f.name || `${f.brand} ${f.model}`}
            </h3>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium opacity-60 truncate w-full">
              {f.category?.replace('_', ' ')} {f.year ? `• ${f.year}` : ''}
            </p>
          </div>

        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
          <button 
            onClick={() => onEdit(appliance)} 
            className="p-1.5 rounded-lg text-text-muted hover:text-brand-400 hover:bg-brand-500/10 transition-colors"
            title="Edit profiling"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(appliance.id)} 
            className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete appliance"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-auto">
        <div className="bg-surface-950/50 rounded-lg p-2.5 border border-white/[0.04]">
          <p className="text-[9px] uppercase tracking-widest font-bold text-text-muted flex items-center gap-1.5 mb-1">
            <Zap className="w-2.5 h-2.5 text-brand-400" /> 
            Rating
          </p>
          <p className="text-xs font-mono font-semibold text-text-primary">
            {f.wattage ? `${f.wattage}W` : '—'}
          </p>
        </div>
        <div className="bg-surface-950/50 rounded-lg p-2.5 border border-white/[0.04]">
          <p className="text-[9px] uppercase tracking-widest font-bold text-text-muted flex items-center gap-1.5 mb-1">
            <Clock className="w-2.5 h-2.5 text-blue-400" /> 
            Daily Use
          </p>
          <p className="text-xs font-mono font-semibold text-text-primary">
            {f.hoursPerDay ? `${f.hoursPerDay}h` : '—'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/[0.04] gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border truncate ${
            f.energyRating?.includes('inverter') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
            f.energyRating?.includes('star') && !f.energyRating.startsWith('1') ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
            'bg-surface-800 text-text-muted border-white/[0.06]'
          }`}>
            {f.energyRating?.replace('-', ' ') || 'Untested'}
          </span>
        </div>
        
        {estimatedMonthlyKwh && (
          <div className="text-right shrink-0">
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-[10px] text-text-muted">Total:</span>
              <p className="text-sm font-bold text-brand-400 font-mono tracking-tight">{estimatedMonthlyKwh} kWh</p>
            </div>
            {estimatedMonthlyCost !== null && (
               <p className="text-[10px] text-text-muted font-mono truncate">≈ ₱{Number(estimatedMonthlyCost).toLocaleString()}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
