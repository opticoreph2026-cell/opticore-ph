export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-brand-500/10 rounded-xl ${className}`} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-4 lg:p-0 space-y-12 animate-fade-up max-w-[1400px] mx-auto">
      {/* HeroStrip Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-96 rounded-2xl" />
          <Skeleton className="h-6 w-80" />
        </div>
        <Skeleton className="h-16 w-48 rounded-2xl" />
      </div>

      {/* KPI Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-48 rounded-[32px] bg-white/[0.03] border border-white/5 p-8 space-y-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Intelligence Row Skeleton */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7 h-96 rounded-[32px] bg-white/[0.03] border border-white/5 p-10">
          <div className="flex items-center justify-between mb-10">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-32 w-full mb-8" />
          <div className="grid grid-cols-3 gap-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-5 h-96 rounded-[32px] bg-white/[0.03] border border-white/5 p-10">
          <Skeleton className="h-8 w-40 mb-10" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="card p-0 overflow-hidden border-white/[0.04]">
      <div className="p-4 border-b border-white/[0.04]">
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="divide-y divide-white/[0.04]">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 w-1/3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
