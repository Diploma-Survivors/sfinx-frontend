'use client';

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { Problem } from '@/types/problems';
import { SortBy, SortOrder } from '@/types/problems';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import ProblemTableRow from './problems-table-row';

interface ProblemTableProps {
  problems: Problem[];
  hasMore: boolean;
  onLoadMore: () => void;
  isLoading?: boolean;
  totalCount?: number;
  scrollableTarget?: string;
  openInNewTab?: boolean;
}

export default function ProblemTable({
  problems,
  hasMore,
  onLoadMore,
  isLoading = false,
  totalCount = 0,
  scrollableTarget,
  openInNewTab,
}: ProblemTableProps) {
  const { t } = useTranslation('problems');

  return (
    <div className="w-full border border-border rounded-xl">
      <InfiniteScroll
        dataLength={problems.length}
        next={onLoadMore}
        hasMore={hasMore}
        loader={
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        }
        endMessage={
          !isLoading &&
          problems.length > 0 && (
            <div className="text-center py-6 px-4">
              <p className="text-xs text-muted-foreground">
                {t('all_problems_loaded')}
              </p>
            </div>
          )
        }
        scrollThreshold={0.9}
        style={{ overflow: 'visible' }}
        scrollableTarget={scrollableTarget}
      >
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="w-12 text-center py-3">
                  {/* Status */}
                </TableHead>

                <TableHead className="w-16 font-medium text-muted-foreground text-center py-3">
                  #
                </TableHead>
                <TableHead className="font-medium text-muted-foreground py-3">
                  <div className="flex items-center">{t('title')}</div>
                </TableHead>

                <TableHead className="w-4 py-1">
                  {/* Premium Status */}
                </TableHead>

                <TableHead className="w-32 font-medium text-muted-foreground py-3">
                  <div className="flex items-center">{t('difficulty')}</div>
                </TableHead>

                <TableHead className="w-28 text-center font-medium text-muted-foreground py-3">
                  {t('ac_rate')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {problems.map((problem) => (
                <ProblemTableRow key={problem.id} problem={problem} openInNewTab={openInNewTab} />
              ))}
            </TableBody>
          </Table>
        </div>
      </InfiniteScroll>
    </div>
  );
}
