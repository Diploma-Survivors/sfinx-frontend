'use client';

import { DescriptionPanel } from '@/components/problems/tabs/description/panels/description-panel/description-panel';
import { Skeleton } from '@/components/ui/skeleton';
import { useProblemDetail } from '@/contexts/problem-detail-context';

export default function ProblemDescriptionPage() {
  const { problem, isLoading } = useProblemDetail();

  if (isLoading || !problem) {
    return (
      <div className="h-full overflow-y-auto p-8 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  return <DescriptionPanel problem={problem} width={100} />;
}
