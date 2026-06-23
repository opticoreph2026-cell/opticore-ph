export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-accent-amber border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading lead details...</p>
      </div>
    </div>
  );
}
