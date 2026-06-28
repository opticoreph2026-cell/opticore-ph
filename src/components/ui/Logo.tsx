import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  compact?: boolean;
  href?: string;
}

export function Logo({ className = 'h-9', compact = false, href = '/' }: LogoProps) {
  return (
    <Link href={href} className={`flex items-center group ${className}`}>
      <div className="h-9 rounded-lg px-1.5 flex items-center justify-center transition-all bg-white/95 dark:bg-background-800/80 backdrop-blur-sm">
        <img src="/logo.png" alt="" className="h-7 w-auto block dark:hidden" />
        <img src="/logo-white.png" alt="OptiCore Energy Solutions" className="h-7 w-auto hidden dark:block" />
      </div>
    </Link>
  );
}
