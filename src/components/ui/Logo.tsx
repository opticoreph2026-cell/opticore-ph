import React from 'react';
import { Link } from '@/i18n/routing';

interface LogoProps {
  className?: string;
  compact?: boolean;
}

export function Logo({ className = 'h-8', compact = false }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 group ${className}`}>
      {/* Icon mark — stylized "O" with solar ray */}
      <div className="relative flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-[#F5A524] via-[#F5A524]/80 to-[#06B6D4] shadow-lg group-hover:shadow-[#F5A524]/30 transition-all duration-300 flex items-center justify-center">
        {/* Solar core */}
        <svg
          className="w-5 h-5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Sun rays */}
          <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
          <line x1="12" y1="2" x2="12" y2="5" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
          <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
          <line x1="2" y1="12" x2="5" y2="12" />
          <line x1="19" y1="12" x2="22" y2="12" />
          <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
          <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
        </svg>
        {/* Glow pulse */}
        <span className="absolute inset-0 rounded-xl bg-[#F5A524]/20 group-hover:bg-[#F5A524]/30 transition-colors duration-300" />
      </div>

      {!compact && (
        <div className="flex flex-col leading-tight">
          <span className="font-display font-bold text-[15px] tracking-tight text-white leading-none">
            OptiCore
          </span>
          <span className="text-[10px] font-medium text-[#F5A524]/80 tracking-widest uppercase leading-none mt-0.5">
            Energy Solutions
          </span>
        </div>
      )}
    </Link>
  );
}
