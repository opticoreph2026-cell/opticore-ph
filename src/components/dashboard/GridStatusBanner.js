'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Zap } from 'lucide-react';

export default function GridStatusBanner() {
  const [grid, setGrid] = useState(null);

  useEffect(() => {
    fetch('/api/dashboard/grid-status')
      .then(res => res.json())
      .then(data => setGrid(data))
      .catch(console.error);
  }, []);

  if (!grid || grid.status === 'NORMAL') return null; // Silent if normal

  const isRed = grid.status === 'RED';
  
  return (
    <div className={`mb-6 p-4 rounded-2xl flex items-start sm:items-center gap-4 animate-fade-down shadow-xl border-l-4
      ${isRed ? 'bg-red-500/10 border-red-500 border-r-red-500/30 border-y-red-500/30 text-red-200' : 'bg-orange-500/10 border-orange-500 border-r-orange-500/30 border-y-orange-500/30 text-orange-200'}`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg
        ${isRed ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : 'bg-orange-500/20 text-orange-400 border border-orange-500/50 animate-pulse'}`}
      >
        {isRed ? <ShieldAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
      </div>
      
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <p className={`text-[10px] font-black uppercase tracking-widest ${isRed ? 'text-red-400' : 'text-orange-400'}`}>
            NGCP Grid {grid.status} Alert
          </p>
          <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider flex items-center gap-1 ${isRed ? 'bg-red-500/20 text-red-300' : 'bg-orange-500/20 text-orange-300'}`}>
             <Zap className="w-2.5 h-2.5" /> +{grid.surgePenaltyPercent}% Spot Market Surge
          </span>
        </div>
        <p className="text-sm font-semibold">{grid.message}</p>
      </div>
    </div>
  );
}
