'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ContestSortBy } from '@/types/contests';
import { SortOrder } from '@/types/problems';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ContestSortControlsProps {
  sortBy: ContestSortBy;
  sortOrder: SortOrder;
  onSortByChange: (newSortBy: ContestSortBy) => void;
  onSortOrderChange: (newSortOrder: SortOrder) => void;
}

export default function ContestSortControls({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
}: ContestSortControlsProps) {
  const { t } = useTranslation('contests');

  const sortOptions = [
    { value: ContestSortBy.ID, label: t('sort_options.id') },
    { value: ContestSortBy.START_TIME, label: t('sort_options.startTime') },
  ];

  const getSortIcon = () => {
    if (sortOrder === SortOrder.ASC) {
      return <ArrowUp className="w-4 h-4" />;
    }
    return <ArrowDown className="w-4 h-4" />;
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-5 h-5 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">
          {t('sort_by')}:
        </span>
      </div>

      <Select
        value={sortBy}
        onValueChange={(value) => onSortByChange(value as ContestSortBy)}
      >
        <SelectTrigger className="w-48 h-10 rounded-xl bg-background border border-border focus:ring-primary">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xl border border-border bg-popover text-popover-foreground shadow-xl">
          {sortOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="rounded-lg"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          onSortOrderChange(
            sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC
          )
        }
        className="flex items-center gap-2 h-10 px-4 border border-border bg-background hover:bg-muted rounded-xl transition-all duration-200"
      >
        {getSortIcon()}
        <span className="font-medium">
          {sortOrder === SortOrder.ASC ? t('sort_asc') : t('sort_desc')}
        </span>
      </Button>
    </div>
  );
}
