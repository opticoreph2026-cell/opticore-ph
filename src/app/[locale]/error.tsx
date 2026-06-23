'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#08080B]">
      <div className="text-center space-y-4 p-8">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
        <p className="text-gray-400 max-w-md">{error.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={reset}
          className="px-6 py-2 bg-[#F5A524] text-[#08080B] font-medium rounded-lg hover:bg-[#e0961f] transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
