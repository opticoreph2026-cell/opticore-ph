import React from 'react';
import { Zap } from 'lucide-react';

/**
 * OptiCore PH - Unified Lightning Logo
 * Represents high-precision engineering and energy intelligence.
 */
export default function Logo({ className = "w-8 h-8" }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      {/* Dynamic Glow Layer */}
      <div className="absolute inset-0 bg-cyan-500/20 rounded-xl blur-[20px] animate-pulse-slow" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" />
      
      {/* Lightning Icon with custom gradient */}
      <Zap 
        className="w-[60%] h-[60%] relative z-10 text-cyan-400 fill-cyan-400/30 filter drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]" 
        strokeWidth={2.5}
      />
    </div>
  );
}
