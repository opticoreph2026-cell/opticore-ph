export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-accent-emerald border-t-transparent rounded-full animate-spin" />
        <p className="text-foreground-400 text-sm">Loading partner portal...</p>
      </div>
    </div>
  );
}
