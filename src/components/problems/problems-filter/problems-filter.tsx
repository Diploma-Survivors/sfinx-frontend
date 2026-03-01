'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { type ProblemFilters, ProblemStatus } from '@/types/problems';
import type { Tag } from '@/types/tags';
import type { Topic } from '@/types/topics';
import { CheckCircle2, Circle, Clock, RotateCcw, Search } from 'lucide-react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import DifficultyFilter from './difficulty-filter';
import MyListsFilter from '../favorite-list/my-lists';
import TagFilter from './tags-filter';
import TopicFilter from './topics-filter';
import { useApp } from '@/contexts/app-context';

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
  const { user } = useApp();

  // Helper function to toggle items in array filters (topicIds, tagIds)
  const toggleArrayFilter = useCallback(
    (filterKey: 'topicIds' | 'tagIds', itemId: number, isSelected: boolean) => {
      const currentItems = filters[filterKey] || [];
      const newItems = isSelected
        ? [...currentItems, itemId]
        : currentItems.filter((id: number) => id !== itemId);

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
        <div className="space-y-2">
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
          <div className="flex flex-wrap gap-2">
            {[
              {
                value: ProblemStatus.SOLVED,
                label: t('status_solved'),
                activeClass: 'bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/15',
                inactiveClass: 'border-border/40 hover:border-green-500/30 hover:bg-green-500/5'
              },
              {
                value: ProblemStatus.ATTEMPTED,
                label: t('status_attempted'),
                activeClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/15',
                inactiveClass: 'border-border/40 hover:border-yellow-500/30 hover:bg-yellow-500/5'
              },
              {
                value: ProblemStatus.NOT_STARTED,
                label: t('status_not_started'),
                activeClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30 hover:bg-gray-500/15',
                inactiveClass: 'border-border/40 hover:border-gray-500/30 hover:bg-gray-500/5'
              },
            ].map((status) => {
              const isSelected = filters.status === status.value;
              return (
                <button
                  key={status.value}
                  type="button"
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      status: isSelected ? undefined : status.value,
                    })
                  }
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border',
                    isSelected ? status.activeClass : `text-muted-foreground ${status.inactiveClass}`
                  )}
                >
                  {status.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty Filter */}
        <DifficultyFilter
          selectedDifficulty={filters.difficulty}
          onDifficultyChange={(difficulty) =>
            onFiltersChange({ ...filters, difficulty })
          }
        />

        {/* Topic Filter */}
        <TopicFilter
          topics={topics}
          selectedTopicIds={filters.topicIds || []}
          isLoading={isLoading}
          onTopicToggle={(topicId, isSelected) =>
            toggleArrayFilter('topicIds', topicId, isSelected)
          }
          onClearAll={() => onFiltersChange({ ...filters, topicIds: [] })}
        />

        {/* Tag Filter */}
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

      {/* Divider */}
      {user && <div className="h-px bg-border" />}

      {/* My Lists */}
      {user && (
        <MyListsFilter
          selectedListId={filters.listId}
          onListSelect={(listId) =>
            onFiltersChange({ ...filters, listId })
          }
        />
      )}
    </div>
  );
}
