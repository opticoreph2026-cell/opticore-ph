import React from 'react';
import Link from 'next/link';

export function Logo({ className = "h-8" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 group ${className}`}>
      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-emerald shadow-lg group-hover:shadow-accent-cyan/20 transition-all duration-300">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <span className="font-display font-bold text-xl tracking-tight text-white">
        Tipid<span className="text-white/60">Hub</span>
      </span>
    </Link>
  );
}
