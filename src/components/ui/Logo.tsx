import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  compact?: boolean;
}

export function Logo({ className = 'h-8', compact = false }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center group ${className}`}>
      <div className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-surface-800 backdrop-blur-sm border border-white/10">
        <Image
          src="/logo.png"
          alt="OptiCore Energy Solutions"
          width={180}
          height={50}
          className="object-contain"
          priority
        />
      </div>
    </Link>
  );
}
