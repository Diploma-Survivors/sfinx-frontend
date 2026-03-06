'use client';

import SubmissionsList from '@/components/problems/tabs/submissions/submissions-list';
import SubmissionsSkeleton from '@/components/problems/tabs/submissions/submissions-skeleton';
import useSubmissions from '@/hooks/use-submissions';
import { usePathname, useRouter } from 'next/navigation';

interface SubmissionsPageProps {
  problemId: number;
  contestId?: number;
  onSubmissionSelect?: (submission: any) => void;
}

export default function SubmissionsPage({
  problemId,
  contestId,
  onSubmissionSelect,
}: SubmissionsPageProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Data fetching hook
  const {
    submissions,
    totalCount,
    hasMore,
    isLoading,
    error,
    filters,
    handleFiltersChange,
    handleLoadMore,
  } = useSubmissions(problemId, contestId);

  const handleSelectSubmission = (submission: any) => {
    if (onSubmissionSelect) {
      onSubmissionSelect(submission);
    } else {
      router.push(`${pathname}/${submission.id}`);
    }
  };

  if (isLoading && submissions.length === 0) {
    return <SubmissionsSkeleton showRightPanel={false} />;
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-card">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-card overflow-hidden flex flex-col">
      <SubmissionsList
        submissions={submissions}
        selectedSubmissionId={null}
        onSelectSubmission={(s) => handleSelectSubmission(s)}
        filters={filters}
        onFilterChange={handleFiltersChange}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        isLoading={isLoading}
        totalCount={totalCount}
      />
    </div>
  );
}
