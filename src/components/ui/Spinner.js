import { clsx } from 'clsx';

/**
 * Reusable loading spinner.
 * @param {{ size?: 'sm'|'md'|'lg'; className?: string }} props
 */
export default function Spinner({ size = 'md', className }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <svg
      className={clsx('animate-spin text-brand-500', sizes[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/**
 * Full-page loading screen.
 */
export function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-950 gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-text-muted animate-pulse">Loading…</p>
    </div>
  );
}
