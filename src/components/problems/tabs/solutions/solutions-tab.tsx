'use client';

import { useApp } from '@/contexts/app-context';
import useSolutions from '@/hooks/use-solutions';
import { usePathname, useRouter } from 'next/navigation';
import SolutionFilter from './solution-filter';
import SolutionList from './solution-list';

interface SolutionsTabProps {
  problemId: string;
}

export default function SolutionsTab({ problemId }: SolutionsTabProps) {
  const {
    solutions,
    isLoading,
    meta,
    filters,
    keyword,
    sortBy,
    handleFiltersChange,
    handleKeywordChange,
    handleSortByChange,
    handleSearch,
    handleLoadMore,
  } = useSolutions(problemId);

  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="h-full flex flex-col bg-card">
      <SolutionFilter
        keyword={keyword}
        onKeywordChange={handleKeywordChange}
        onSearch={handleSearch}
        sortBy={sortBy}
        onSortChange={handleSortByChange}
        selectedTags={filters.tagIds || []}
        onTagsChange={(ids) => handleFiltersChange({ ...filters, tagIds: ids })}
        selectedLanguages={filters.languageIds || []}
        onLanguagesChange={(ids) =>
          handleFiltersChange({ ...filters, languageIds: ids })
        }
        problemId={problemId}
      />
      <SolutionList
        solutions={solutions}
        selectedId={undefined}
        onSelect={(id) => {
          router.push(`${pathname}/${id}`);
        }}
        hasMore={meta?.hasNextPage || false}
        onLoadMore={handleLoadMore}
        isLoading={isLoading}
      />
    </div>
  );
}
