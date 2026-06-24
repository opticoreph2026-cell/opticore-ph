import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  compact?: boolean;
}

export function Logo({ className = 'h-8', compact = false }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center group ${className}`}>
      <div className="flex-shrink-0 flex items-center px-3 py-1 rounded-xl bg-surface-800 backdrop-blur-sm border border-white/10">
        <svg
          viewBox="0 0 250 55"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-auto"
          role="img"
          aria-label="OptiCore Energy Solutions"
        >
          {/* Solar Panel Icon */}
          <g transform="translate(2, 10)">
            <rect x="0" y="0" width="34" height="26" rx="2" stroke="white" strokeWidth="1.5" fill="none" />
            <line x1="11.3" y1="0" x2="11.3" y2="26" stroke="white" strokeWidth="1" />
            <line x1="22.6" y1="0" x2="22.6" y2="26" stroke="white" strokeWidth="1" />
            <line x1="0" y1="13" x2="34" y2="13" stroke="white" strokeWidth="1" />
          </g>

          {/* Sun accent */}
          <circle cx="42" cy="8" r="3.5" fill="white" opacity="0.7" />
          <line x1="42" y1="2" x2="42" y2="0.5" stroke="white" strokeWidth="1" opacity="0.5" />
          <line x1="47.5" y1="8" x2="49" y2="8" stroke="white" strokeWidth="1" opacity="0.5" />
          <line x1="46" y1="3.5" x2="47" y2="2.5" stroke="white" strokeWidth="1" opacity="0.5" />
          <line x1="46" y1="12.5" x2="47" y2="13.5" stroke="white" strokeWidth="1" opacity="0.5" />
          <line x1="38" y1="3.5" x2="37" y2="2.5" stroke="white" strokeWidth="1" opacity="0.5" />
          <line x1="38" y1="12.5" x2="37" y2="13.5" stroke="white" strokeWidth="1" opacity="0.5" />
          <line x1="36.5" y1="8" x2="35" y2="8" stroke="white" strokeWidth="1" opacity="0.5" />

          {/* "OptiCore" text */}
          <text
            x="50"
            y="30"
            fontFamily="'Outfit', system-ui, sans-serif"
            fontWeight="700"
            fontSize="26"
            fill="white"
          >
            OptiCore
          </text>

          {/* "ENERGY SOLUTIONS" subtitle */}
          <text
            x="50"
            y="46"
            fontFamily="'Outfit', system-ui, sans-serif"
            fontWeight="400"
            fontSize="9"
            fill="white"
            letterSpacing="3.5"
          >
            ENERGY SOLUTIONS
          </text>
        </svg>
      </div>
    </Link>
  );
}
