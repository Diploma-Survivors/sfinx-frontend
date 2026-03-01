'use client';

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Contest } from '@/types/contests';
import React from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import ContestTableRow from './contest-table-row';

interface ContestTableProps {
  contests: Contest[];
  isLoading: boolean;
  error: string | null;
  pageInfo: any;
  onLoadMore: () => void;
  openInNewTab?: boolean;
}

export default function ContestTable({
  contests,
  isLoading,
  error,
  pageInfo,
  onLoadMore,
  openInNewTab,
}: ContestTableProps) {
  const { t } = useTranslation('contests');

  return (
    <div className="w-full">
      {/* Loading State */}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
          <p className="text-destructive font-medium">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && contests.length === 0 && (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground">{t('no_contests_found')}</p>
        </div>
      )}

      {!error && contests.length > 0 && (
        <InfiniteScroll
          dataLength={contests.length}
          next={onLoadMore}
          hasMore={pageInfo?.hasNextPage ?? false}
          loader={
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          }
          endMessage={
            <div className="text-center py-6 px-4">
              <p className="text-xs text-muted-foreground">
                {t('all_contests_loaded')}
              </p>
            </div>
          }
          scrollThreshold={0.9}
          style={{ overflow: 'visible' }}
        >
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="w-12 text-center py-3">
                    {/* Status Icon */}
                  </TableHead>
                  <TableHead className="font-medium text-muted-foreground py-3">
                    {t('contest_name')}
                  </TableHead>
                  <TableHead className="w-48 font-medium text-muted-foreground py-3">
                    {t('start_time')}
                  </TableHead>
                  <TableHead className="w-32 font-medium text-muted-foreground py-3">
                    {t('duration')}
                  </TableHead>
                  <TableHead className="w-32 text-center font-medium text-muted-foreground py-3">
                    {t('status')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contests.map((contest) => (
                  <ContestTableRow key={contest.id} contest={contest} openInNewTab={openInNewTab} />
                ))}
              </TableBody>
            </Table>
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
}
