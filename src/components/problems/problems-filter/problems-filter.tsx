'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type ProblemFilters, ProblemStatus } from '@/types/problems';
import type { Tag } from '@/types/tags';
import type { Topic } from '@/types/topics';
import { RotateCcw, Search, CheckCircle2, Circle, Clock } from 'lucide-react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import DifficultyFilter from './difficulty-filter';
import TagFilter from './tags-filter';
import TopicFilter from './topics-filter';
import { cn } from '@/lib/utils';

interface ProblemFilterProps {
  keyWord: string;
  filters: ProblemFilters;
  tags: Tag[];
  topics: Topic[];
  isLoading: boolean;
  onKeywordChange: (newKeyword: string) => void;
  onFiltersChange: (newFilters: ProblemFilters) => void;
  onReset: () => void;
}

export default function ProblemFilter({
  keyWord,
  filters,
  tags,
  topics,
  isLoading,
  onKeywordChange,
  onFiltersChange,
  onReset,
  className,
}: ProblemFilterProps & { className?: string }) {
  const { t } = useTranslation('problems');

  // Helper function to toggle items in array filters (topicIds, tagIds)
  const toggleArrayFilter = useCallback(
    (filterKey: 'topicIds' | 'tagIds', itemId: number, isSelected: boolean) => {
      const currentItems = filters[filterKey] || [];
      const newItems = isSelected
        ? currentItems.filter((id: number) => id !== itemId)
        : [...currentItems, itemId];

      onFiltersChange({ ...filters, [filterKey]: newItems });
    },
    [filters, onFiltersChange]
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          {t('filters')}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          {t('reset')}
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t('search_problems')}
          value={keyWord || ''}
          onChange={(e) => onKeywordChange(e.target.value)}
          className="pl-9 h-10 bg-background text-sm"
        />
      </div>

      <div className="space-y-6">
        {/* Status Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('status')}
            </label>
            {filters.status && (
              <button
                type="button"
                onClick={() =>
                  onFiltersChange({ ...filters, status: undefined })
                }
                className="text-[10px] font-medium text-muted-foreground hover:text-foreground"
              >
                {t('clear')}
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {[
              ProblemStatus.SOLVED,
              ProblemStatus.ATTEMPTED,
              ProblemStatus.NOT_STARTED,
            ].map((status) => {
              const isSelected = filters.status === status;

              const getStatusColor = (s: ProblemStatus) => {
                if (!isSelected)
                  return 'bg-background text-muted-foreground border-transparent hover:bg-muted';
                switch (s) {
                  case ProblemStatus.SOLVED:
                    return 'bg-green-500/10 text-green-600 border-green-200 dark:border-green-800';
                  case ProblemStatus.ATTEMPTED:
                    return 'bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-800';
                  case ProblemStatus.NOT_STARTED:
                    return 'bg-gray-500/10 text-gray-600 border-gray-200 dark:border-gray-800';
                  default:
                    return 'bg-background text-muted-foreground border-transparent';
                }
              };

              const getStatusIcon = (s: ProblemStatus) => {
                switch (s) {
                  case ProblemStatus.SOLVED:
                    return <CheckCircle2 className="w-4 h-4 mr-2" />;
                  case ProblemStatus.ATTEMPTED:
                    return <Circle className="w-4 h-4 mr-2" />;
                  case ProblemStatus.NOT_STARTED:
                    return <div className="w-4 h-4 mr-2" />;
                  default:
                    return <div className="w-4 h-4 mr-2" />;
                }
              };

              const getStatusLabel = (s: ProblemStatus) => {
                switch (s) {
                  case ProblemStatus.SOLVED:
                    return t('status_solved');
                  case ProblemStatus.ATTEMPTED:
                    return t('status_attempted');
                  case ProblemStatus.NOT_STARTED:
                    return t('status_not_started');
                  default:
                    return '';
                }
              };

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      status: isSelected ? undefined : status,
                    })
                  }
                  className={cn(
                    'flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors border',
                    getStatusColor(status)
                  )}
                >
                  {getStatusIcon(status)}
                  {getStatusLabel(status)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('difficulty')}
            </label>
          </div>
          <DifficultyFilter
            selectedDifficulty={filters.difficulty}
            onDifficultyChange={(difficulty) =>
              onFiltersChange({ ...filters, difficulty })
            }
          />
        </div>

        {/* Topic Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('topics')}
            </label>
          </div>
          <TopicFilter
            topics={topics}
            selectedTopicIds={filters.topicIds || []}
            isLoading={isLoading}
            onTopicToggle={(topicId, isSelected) =>
              toggleArrayFilter('topicIds', topicId, isSelected)
            }
            onClearAll={() => onFiltersChange({ ...filters, topicIds: [] })}
          />
        </div>

        {/* Tag Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('tags')}
            </label>
          </div>
          <TagFilter
            tags={tags}
            selectedTagIds={filters.tagIds || []}
            isLoading={isLoading}
            onTagToggle={(tagId, isSelected) =>
              toggleArrayFilter('tagIds', tagId, isSelected)
            }
            onClearAll={() => onFiltersChange({ ...filters, tagIds: [] })}
            displayLimit={5}
          />
        </div>
      </div>
    </div>
  );
}
