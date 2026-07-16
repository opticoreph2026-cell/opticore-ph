import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  compact?: boolean;
  href?: string;
}

export function Logo({ className = 'h-9', compact = false, href = '/' }: LogoProps) {
  return (
    <Link href={href} className={`flex items-center group ${className}`}>
      <div className="h-9 rounded-lg px-1.5 flex items-center justify-center transition-all bg-white/95 backdrop-blur-sm">
        <Image src="/logo.png" alt="OptiCore Energy Solutions" className="h-7 w-auto" width={140} height={28} priority />
      </div>
    </Link>
  );
}
