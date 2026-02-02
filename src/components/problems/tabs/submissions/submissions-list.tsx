'use client';

import type { SubmissionFilters, Submission } from '@/types/submissions';
import type { GetSubmissionListRequest } from '@/types/submissions';
import { Loader2, Search } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import SubmissionRow from './submission-row';
import SubmissionsFilter from './submissions-filter';

import { useTranslation } from 'react-i18next';

interface SubmissionsListProps {
  submissions: Submission[];
  selectedSubmissionId: number | null;
  onSelectSubmission: (submission: Submission) => void;
  filters: SubmissionFilters;
  onFilterChange: (filters: SubmissionFilters) => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
  totalCount?: number;
}

export default function SubmissionsList({
  submissions,
  selectedSubmissionId,
  onSelectSubmission,
  filters,
  onFilterChange,
  hasMore = false,
  onLoadMore,
  isLoading = false,
  totalCount = 0,
}: SubmissionsListProps) {
  const { t } = useTranslation('problems');

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden pl-2">
      {/* Search Filters */}
      <SubmissionsFilter onFilterChange={onFilterChange} filters={filters} />

      {/* Submissions Table */}
      <div
        className="flex-1 overflow-y-auto bg-gray-50"
        id="submissions-scroll-container"
      >
        {submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('no_submissions_found')}
            </h3>
            <p className="text-gray-500 text-center max-w-sm">
              {t('no_submissions_description')}
            </p>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={submissions.length}
            next={onLoadMore || (() => {})}
            hasMore={hasMore}
            loader={
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="dots-loader mb-4" />
              </div>
            }
            scrollableTarget="submissions-scroll-container"
            className="overflow-x-auto"
          >
            <table className="w-full">
              <thead className="bg-white border-b border-gray-200 sticky top-0 z-10 text-xs">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 tracking-wider">
                    {t('status')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 tracking-wider">
                    {t('language')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 tracking-wider">
                    {t('runtime')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 tracking-wider">
                    {t('memory')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission, index) => (
                  <SubmissionRow
                    key={submission.id}
                    submission={submission}
                    index={index}
                    isSelected={selectedSubmissionId === submission.id}
                    onSelect={onSelectSubmission}
                  />
                ))}
              </tbody>
            </table>
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
}
