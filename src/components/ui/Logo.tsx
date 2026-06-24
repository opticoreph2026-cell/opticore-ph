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
        <img
          src="/logo.svg"
          alt="OptiCore Energy Solutions"
          className="h-6 w-auto object-contain"
        />
      </div>
    </Link>
  );
}
