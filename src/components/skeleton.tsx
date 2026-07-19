export function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-card/60 ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="space-y-4">
      <div className="aspect-[4/3] animate-pulse rounded-lg bg-card/60" />
      <div className="space-y-3">
        <SkeletonLine className="h-3 w-20" />
        <SkeletonLine className="h-6 w-48" />
        <div className="flex gap-3">
          <SkeletonLine className="h-3 w-14" />
          <SkeletonLine className="h-3 w-14" />
          <SkeletonLine className="h-3 w-14" />
        </div>
        <div className="flex items-center justify-between border-t border-border/30 pt-3">
          <SkeletonLine className="h-6 w-24" />
          <SkeletonLine className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine
          key={i}
          className={`h-4 ${i === lines - 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      <SkeletonLine className="h-3 w-24" />
      <SkeletonLine className="mt-4 h-12 w-96" />
      <SkeletonLine className="mt-4 h-4 w-72" />
      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
