'use client';

import { TriangleAlert } from 'lucide-react';

export default function DashboardError({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <TriangleAlert className="w-6 h-6 text-red-400" />
      </div>
      <h2 className="font-semibold text-text-primary">Failed to load this section</h2>
      <p className="text-sm text-text-muted max-w-xs">
        {process.env.NODE_ENV === 'development' ? error?.message : 'An error occurred loading your data.'}
      </p>
      <button onClick={reset} className="btn-ghost text-sm px-4 py-2 mt-2">
        Try again
      </button>
    </div>
  );
}
