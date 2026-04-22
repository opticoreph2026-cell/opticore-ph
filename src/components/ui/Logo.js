import React from 'react';

/**
 * OptiCore PH - Unified Triple-Shard Logo
 * Represents the 3 utility pillars: Electricity (Amber), Water (Cyan), Gas (Crimson)
 */
export default function Logo({ className = "w-8 h-8" }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      {/* Outer Glow Halo */}
      <div className="absolute inset-0 bg-white/5 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]" />
      
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-[60%] h-[60%] drop-shadow-xl relative z-10"
      >
        {/* Core Crystal - Central Hexagon Base */}
        <polygon 
          points="50,15 80,32 80,68 50,85 20,68 20,32" 
          fill="#1C1C28" 
          stroke="rgba(255,255,255,0.1)" 
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* 1. Electrical Shard (Amber - Top Right) */}
        <path 
          d="M50,18 L76,33 L76,65 L50,50 Z" 
          fill="url(#amber-grad)" 
          className="animate-pulse-slow"
        />

        {/* 2. Water Shard (Cyan - Bottom Left) */}
        <path 
          d="M24,33 L50,50 L50,82 L24,65 Z" 
          fill="url(#cyan-grad)"
        />

        {/* 3. Gas/LPG Shard (Crimson - Bottom Right Base) */}
        <path 
          d="M50,50 L76,65 L50,82 L24,65 Z" 
          fill="url(#crimson-grad)" 
          className="opacity-90"
        />

        {/* Inner Core Light */}
        <polygon 
          points="50,40 58,45 58,55 50,60 42,55 42,45" 
          fill="#FFFFFF"
          className="shadow-[0_0_10px_#FFFFFF]"
        />

        <defs>
          <linearGradient id="amber-grad" x1="50" y1="18" x2="76" y2="65">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="cyan-grad" x1="24" y1="33" x2="50" y2="82">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="crimson-grad" x1="24" y1="65" x2="76" y2="65">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#be123c" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
