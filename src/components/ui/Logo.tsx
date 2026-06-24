import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  compact?: boolean;
}

export function Logo({ className = 'h-8', compact = false }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 group ${className}`}>
      <div className="relative flex-shrink-0 w-8 h-8 rounded-xl overflow-hidden">
        <Image
          src="/logo.png"
          alt="OptiCore Energy Solutions"
          width={32}
          height={32}
          className="w-full h-full object-contain"
        />
      </div>

      {!compact && (
        <div className="flex flex-col leading-tight">
          <span className="font-display font-bold text-[15px] tracking-tight text-white leading-none">
            OptiCore
          </span>
          <span className="text-[10px] font-medium text-accent-blue/80 tracking-widest uppercase leading-none mt-0.5">
            Energy Solutions
          </span>
        </div>
      )}
    </Link>
  );
}
