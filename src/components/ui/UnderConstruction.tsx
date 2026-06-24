import React from 'react';
import Link from 'next/link';
import { Construction } from 'lucide-react';

interface UnderConstructionProps {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}

export function UnderConstruction({
  title = 'Page Under Construction',
  description = 'We\'re building something awesome. This page will be available soon.',
  backHref = '/',
  backLabel = 'Back to Home',
}: UnderConstructionProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-accent-cyan/10 flex items-center justify-center mx-auto">
          <Construction className="w-8 h-8 text-accent-cyan" />
        </div>
        <h1 className="text-2xl font-display font-bold text-white">{title}</h1>
        <p className="text-sm text-white/60">{description}</p>
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-accent-cyan hover:text-accent-cyan/80 transition-colors"
        >
          <span>&larr;</span> {backLabel}
        </Link>
      </div>
    </div>
  );
}
