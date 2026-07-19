'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-50">
      <div className="text-center space-y-4 p-8">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-foreground-950">Something went wrong</h1>
        <p className="text-gray-400 max-w-md">{error.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={reset}
          className="px-6 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-500/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
