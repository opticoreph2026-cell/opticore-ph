import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-accent-cyan/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center">
        <Logo className="mb-8 h-12" />
        
        <div className="text-center">
          <p className="text-sm font-semibold text-accent-cyan tracking-wider uppercase mb-2">404 Error</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground-950 tracking-tight mb-4">
            Page not found
          </h1>
          <p className="text-base text-foreground-950/60 mb-8 max-w-sm mx-auto">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
          
          <Link 
            href="/" 
            className="inline-flex px-6 py-3 text-sm font-medium rounded-xl bg-foreground-950/10 hover:bg-foreground-950/20 text-foreground-950 border border-border-subtle transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
