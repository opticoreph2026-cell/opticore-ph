import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  compact?: boolean;
  href?: string;
}

export function Logo({ className = 'h-8', compact = false, href = '/' }: LogoProps) {
  return (
    <Link href={href} className={`flex items-center group ${className}`}>
      <div className="bg-white rounded-xl p-1 inline-flex">
        <img
          src="/logo.png"
          alt="OptiCore Energy Solutions"
          className="h-12 w-auto block"
        />
      </div>
    </Link>
  );
}
