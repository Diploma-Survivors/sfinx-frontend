'use client';

import ContestFilter from '@/components/contest/contest-filter';
import ContestListSkeleton from '@/components/contest/contest-list-skeleton';
import ContestSortControls from '@/components/contest/contest-sort-controls';
import ContestTable from '@/components/contest/contest-table';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import useContests from '@/hooks/use-contests';
import { Filter } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ContestsPage() {
  const { t } = useTranslation('contests');
  const {
    // State
    contests,
    pageInfo,
    isLoading,
    error,

    // state for controlled inputs
    search,
    filters,

    // Actions
    handleSearchChange,
    handleFiltersChange,
    handleReset,
    handleLoadMore,
    handleSortByChange,
    handleSortOrderChange,
    sortBy,
    sortOrder,
  } = useContests();

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Left Sidebar - Fixed Desktop */}
        <aside className="hidden lg:block w-[280px] shrink-0 border-r border-border bg-card sticky left-0 top-16 h-[calc(100vh-4rem)] z-30">
          <div className="h-full overflow-y-auto p-6">
            <ContestFilter
              search={search}
              filters={filters}
              onSearchChange={handleSearchChange}
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
                  {t('contests')}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {t('explore_contests')}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <ContestSortControls
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
                    <SheetTitle className="sr-only">{t('filters')}</SheetTitle>
                    <div className="mt-6">
                      <ContestFilter
                        search={search}
                        filters={filters}
                        onSearchChange={handleSearchChange}
                        onFiltersChange={handleFiltersChange}
                        onReset={handleReset}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {isLoading && contests.length === 0 ? (
              <ContestListSkeleton />
            ) : (
              <ContestTable
                contests={contests}
                isLoading={isLoading}
                error={error}
                pageInfo={pageInfo}
                onLoadMore={handleLoadMore}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
