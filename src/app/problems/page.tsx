'use client';

import ProblemFilter from '@/components/problems/problems-filter/problems-filter';
import SortControls from '@/components/problems/problems-filter/sort-controls';
import ProblemTable from '@/components/problems/problems-table/problems-table';
import ProblemListSkeleton from '@/components/problems/problem-list-skeleton';
import { Button } from '@/components/ui/button';
import useProblems from '@/hooks/use-problems';
import { cn } from '@/lib/utils';
import { Filter } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function ProblemsPage() {
  const { t } = useTranslation('problems');
  const {
    // State
    problems,
    pageInfo,
    totalCount,
    isLoading,
    error,

    // Metadata
    tags,
    topics,
    isMetadataLoading,

    // Request params (exposed for UI)
    filters,
    keyword,
    sortBy,
    sortOrder,

    // Handlers
    handleFiltersChange,
    handleKeywordChange,
    handleSortByChange,
    handleSortOrderChange,
    handleReset,
    handleLoadMore,
  } = useProblems();

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Left Sidebar - Fixed Desktop */}
        <aside className="hidden lg:block w-[280px] shrink-0 border-r border-border bg-card sticky left-0 top-16 h-[calc(100vh-4rem)] z-30">
          <div className="h-full overflow-y-auto p-6">
            <ProblemFilter
              keyWord={keyword}
              filters={filters}
              tags={tags}
              topics={topics}
              isLoading={isMetadataLoading}
              onKeywordChange={handleKeywordChange}
              onFiltersChange={handleFiltersChange}
              onReset={handleReset}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="container mx-auto px-4 lg:px-8 py-8 max-w-[1600px]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {t('problems_list')}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {t('explore_problems')}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <SortControls
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortByChange={handleSortByChange}
                  onSortOrderChange={handleSortOrderChange}
                />

                {/* Mobile Filter Trigger */}
                <Sheet
                  open={isMobileFilterOpen}
                  onOpenChange={setIsMobileFilterOpen}
                >
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <Filter className="mr-2 h-4 w-4" />
                      {t('filters')}
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-[300px] sm:w-[400px] p-6"
                  >
                    <div className="mt-6">
                      <ProblemFilter
                        keyWord={keyword}
                        filters={filters}
                        tags={tags}
                        topics={topics}
                        isLoading={isMetadataLoading}
                        onKeywordChange={handleKeywordChange}
                        onFiltersChange={handleFiltersChange}
                        onReset={handleReset}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Error State */}
            {error && !isLoading && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center mb-6">
                <p className="text-destructive font-medium">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="mt-4"
                >
                  {t('try_again')}
                </Button>
              </div>
            )}

            {/* Problem Table */}
            {isLoading && problems.length === 0 ? (
              <ProblemListSkeleton />
            ) : (
              <ProblemTable
                problems={problems}
                hasMore={pageInfo?.hasNextPage ?? false}
                onLoadMore={handleLoadMore}
                isLoading={isLoading}
                totalCount={totalCount}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
