'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-950">
      <div className="text-center space-y-4 p-8">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-foreground-950">Partner Portal Error</h1>
        <p className="text-foreground-400 max-w-md">{error.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={reset}
          className="px-6 py-2 bg-accent-emerald text-foreground-950 font-medium rounded-lg hover:bg-accent-emerald/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
