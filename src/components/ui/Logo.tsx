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
      <div className="relative flex-shrink-0 w-36 h-10">
        <Image
          src="/logo.svg"
          alt="OptiCore Energy Solutions"
          fill
          className="object-contain object-left"
          priority
        />
      </div>
    </Link>
  );
}
