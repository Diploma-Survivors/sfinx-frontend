'use client';

import { Skeleton } from '@/components/ui/skeleton';
import type { Solution } from '@/types/solutions';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import SolutionItem from './solution-item';

interface SolutionListProps {
  solutions: Solution[];
  selectedId?: string;
  onSelect: (id: string) => void;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoading: boolean;
}

export default function SolutionList({
  solutions,
  selectedId,
  onSelect,
  hasMore,
  onLoadMore,
  isLoading,
}: SolutionListProps) {
  const { t } = useTranslation('problems');
  useEffect(() => {
    if (selectedId) {
      const element = document.getElementById(`solution-item-${selectedId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedId]);

  if (isLoading && solutions.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="flex gap-4 p-4 border-b border-slate-200 dark:border-slate-700"
          >
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (solutions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">{t('no_solutions')}</div>
    );
  }

  return (
    <div id="solution-scroll-target" className="flex-1 overflow-y-auto min-h-0">
      <InfiniteScroll
        dataLength={solutions.length}
        next={onLoadMore}
        hasMore={hasMore}
        loader={
          <div className="p-4 space-y-4">
            <div className="flex gap-4 p-4 border-b border-slate-200 dark:border-slate-700">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            </div>
          </div>
        }
        scrollableTarget="solution-scroll-target"
      >
        {solutions.map((solution) => (
          <div id={`solution-item-${solution.id}`} key={solution.id}>
            <SolutionItem
              solution={solution}
              isSelected={solution.id === selectedId}
              onClick={() => onSelect(solution.id)}
            />
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
}
