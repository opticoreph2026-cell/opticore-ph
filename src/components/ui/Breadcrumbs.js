'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs() {
  const pathname = usePathname();
  
  if (!pathname || pathname === '/dashboard') return null;

  const segments = pathname.split('/').filter(Boolean);
  
  return (
    <nav className="mb-6 flex items-center text-sm w-full animate-fade-up" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        <li>
          <Link href="/dashboard" className="text-text-muted hover:text-brand-400 transition-colors flex items-center">
            <Home className="w-4 h-4" />
            <span className="sr-only">Dashboard Home</span>
          </Link>
        </li>
        {segments.map((segment, index) => {
          if (index === 0 && segment === 'dashboard') return null;
          if (index === 0 && segment === 'admin') return null; // Handle admin paths too if used there
          
          const href = `/${segments.slice(0, index + 1).join('/')}`;
          const isLast = index === segments.length - 1;
          const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

          return (
            <li key={segment} className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-white/[0.15]" />
              {isLast ? (
                <span className="text-text-primary font-medium" aria-current="page">{label}</span>
              ) : (
                <Link href={href} className="text-text-muted hover:text-brand-400 transition-colors">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
