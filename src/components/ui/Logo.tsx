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
      <Image src="/logo.png" alt="OptiCore Energy Solutions" className="h-full w-auto" width={140} height={28} priority />
    </Link>
  );
}
