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
    <div className="bento-card p-6 flex flex-col relative group gap-6 transition-all duration-500 hover:-translate-y-1.5 shadow-glass-sm hover:shadow-glass-lg !bg-white/[0.01] hover:!bg-white/[0.03]">

      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] to-purple-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[inherit]"></div>
      
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="relative group/icon shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-2xl shadow-inner-glow-white transition-transform group-hover/icon:scale-110 duration-500">
              {CATEGORY_ICONS[f.category] || CATEGORY_ICONS.other}
            </div>
            {quantity > 1 && (
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-cyan-500 text-[10px] font-black text-slate-950 flex items-center justify-center border-2 border-slate-900 shadow-xl shadow-cyan-500/20">
                {quantity}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-display font-bold text-white text-base truncate w-full" title={f.name || `${f.brand} ${f.model}`}>
              {f.name || `${f.brand} ${f.model}`}
            </h3>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5 flex items-center gap-1.5">
              <span className="text-cyan-400/50">#</span> {f.category?.replace('_', ' ')} {f.year ? `• ${f.year}` : ''}
            </p>
          </div>
        </div>

        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={() => onEdit(appliance)} 
            className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => onDelete(appliance.id)} 
            className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <Trash className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-auto relative z-10">
        <div className="bg-white/[0.02] rounded-2xl p-3 border border-white/5 shadow-inner-glow-white">
          <p className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-500 flex items-center gap-2 mb-1.5">
            <Zap className="w-3 h-3 text-cyan-400" /> 
            Rating
          </p>
          <p className="text-sm font-mono font-bold text-white tracking-tight">
            {f.wattage ? `${f.wattage}W` : '—'}
          </p>
        </div>
        <div className="bg-white/[0.02] rounded-2xl p-3 border border-white/5 shadow-inner-glow-white">
          <p className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-500 flex items-center gap-2 mb-1.5">
            <Clock className="w-3 h-3 text-purple-400" /> 
            Daily Use
          </p>
          <p className="text-sm font-mono font-bold text-white tracking-tight">
            {f.hoursPerDay ? `${f.hoursPerDay}h` : '—'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-5 border-t border-white/[0.04] gap-4 relative z-10">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className={`text-[9px] uppercase font-black tracking-widest px-3 py-1 rounded-full border truncate ${
            f.energyRating?.includes('inverter') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
            f.energyRating?.includes('star') && !f.energyRating.startsWith('1') ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
            'bg-white/[0.02] text-slate-500 border-white/5'
          }`}>
            {f.energyRating?.replace('-', ' ') || 'Untested'}
          </span>
        </div>
        
        {estimatedMonthlyKwh && (
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-white font-mono tracking-tight leading-none mb-1">{estimatedMonthlyKwh} <span className="text-[10px] text-slate-500">kWh</span></p>
            {estimatedMonthlyCost !== null && (
               <p className="text-[10px] text-cyan-400/70 font-black uppercase tracking-wider">≈ ₱{Number(estimatedMonthlyCost).toLocaleString()}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
