import { Skeleton } from '@/components/ui/skeleton';

export function ContestSolveSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden font-sans">
      {/* Navbar Skeleton */}
      <div className="h-14 border-b border-border bg-background/95 flex items-center justify-between px-4 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="h-4 w-px bg-border mx-2" />
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-2">
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 overflow-hidden relative flex">
        {/* Left Panel (Description) */}
        <div className="w-1/2 h-full border-r border-border p-6 space-y-6 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </div>
          <div className="space-y-4 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="space-y-2 pt-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
        </div>

        {/* Right Panel (Editor) */}
        <div className="w-1/2 h-full flex flex-col">
          <div className="h-10 border-b border-border flex items-center px-4 gap-2">
            <Skeleton className="h-6 w-32 rounded-md" />
            <div className="flex-1" />
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
          <div className="flex-1 p-4">
            <div className="space-y-2">
              {Array.from({ length: 15 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-4 w-full"
                  style={{ width: `${Math.random() * 40 + 60}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
