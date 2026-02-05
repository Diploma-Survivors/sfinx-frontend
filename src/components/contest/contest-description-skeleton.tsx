import { Skeleton } from '@/components/ui/skeleton';

export function ContestDescriptionSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid grid-cols-1 gap-8">
        {/* Hero Card Skeleton */}
        <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden relative p-8 space-y-6">
          <div className="flex justify-center">
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="flex justify-center">
            <Skeleton className="h-12 w-3/4 sm:w-1/2" />
          </div>
          <div className="flex justify-center gap-8">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="max-w-3xl mx-auto pt-4">
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="pt-6 flex justify-center">
            <Skeleton className="h-12 w-40 rounded-md" />
          </div>
        </div>

        {/* Info Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Rules Skeleton */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm md:col-span-2">
            <Skeleton className="h-7 w-40 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="mt-6 pt-4 border-t border-border/50">
              <Skeleton className="h-6 w-32 mb-2" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>

          {/* My Performance Skeleton */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <Skeleton className="h-7 w-40 mb-4" />
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-12" />
              </div>
              <div className="flex justify-center pt-2">
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        </div>

        {/* Problem List Preview Skeleton */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/30">
            <Skeleton className="h-7 w-32" />
          </div>
          <div className="divide-y divide-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 w-full">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="space-y-2 w-full max-w-md">
                    <Skeleton className="h-5 w-48" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
