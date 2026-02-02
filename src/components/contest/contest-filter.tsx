'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  type ContestFilters,
  ContestStatus,
  ContestUserStatus,
} from '@/types/contests';
import {
  RotateCcw,
  Search,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Timer,
  History,
} from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface ContestFilterProps {
  search?: string;
  filters: ContestFilters;
  onSearchChange: (search: string) => void;
  onFiltersChange: (filters: ContestFilters) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export default function ContestFilter({
  search,
  filters,
  onSearchChange,
  onFiltersChange,
  onReset,
  isLoading,
  className,
}: ContestFilterProps & { className?: string }) {
  const { t } = useTranslation('contests');

  const handleFilterChange = (
    key: keyof ContestFilters,
    value: string | number | string[] | undefined
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const toggleUserStatus = (status: ContestUserStatus) => {
    const isSelected = filters.userStatus === status;
    handleFilterChange('userStatus', isSelected ? undefined : status);
  };

  const USER_STATUS_OPTIONS = [
    {
      value: ContestUserStatus.JOINED,
      label: t('joined'),
      icon: CheckCircle2,
      color: 'text-green-500 bg-green-500/10 border-green-200',
    },
    {
      value: ContestUserStatus.NOT_JOINED,
      label: t('not_joined'),
      icon: Circle,
      color: 'text-muted-foreground bg-muted border-transparent',
    },
  ];

  const toggleStatus = (status: string) => {
    const isSelected = filters.status === status;
    handleFilterChange('status', isSelected ? undefined : status);
  };

  const STATUS_OPTIONS = [
    {
      value: ContestStatus.SCHEDULED,
      label: t('scheduled'),
      icon: Clock,
      color: 'text-blue-500 bg-blue-500/10 border-blue-200',
    },
    {
      value: ContestStatus.RUNNING,
      label: t('running'),
      icon: Timer,
      color: 'text-green-500 bg-green-500/10 border-green-200',
    },
    {
      value: ContestStatus.ENDED,
      label: t('ended'),
      icon: History,
      color: 'text-muted-foreground bg-muted border-transparent',
    },
  ];

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
          placeholder={t('search_placeholder')}
          value={search || ''}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-10 bg-background text-sm"
        />
      </div>

      <div className="space-y-6">
        {/* User Status Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('user_status')}
            </label>
            {filters.userStatus && (
              <button
                type="button"
                onClick={() => handleFilterChange('userStatus', undefined)}
                className="text-[10px] font-medium text-muted-foreground hover:text-foreground"
              >
                {t('clear')}
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {USER_STATUS_OPTIONS.map((option) => {
              const isSelected = filters.userStatus === option.value;
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleUserStatus(option.value)}
                  className={cn(
                    'flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors border',
                    isSelected
                      ? option.color
                      : 'bg-background text-muted-foreground border-transparent hover:bg-muted'
                  )}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('status')}
            </label>
            {filters.status && (
              <button
                type="button"
                onClick={() => handleFilterChange('status', undefined)}
                className="text-[10px] font-medium text-muted-foreground hover:text-foreground"
              >
                {t('clear')}
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {STATUS_OPTIONS.map((option) => {
              const isSelected = filters.status === option.value;
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleStatus(option.value)}
                  className={cn(
                    'flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors border',
                    isSelected
                      ? option.color
                      : 'bg-background text-muted-foreground border-transparent hover:bg-muted'
                  )}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Start Time (After) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t('start_after')}
          </label>
          <div className="relative">
            <Input
              type="datetime-local"
              value={filters.startAfter || ''}
              onChange={(e) => handleFilterChange('startAfter', e.target.value)}
              className="h-9 text-xs pl-2"
            />
          </div>
        </div>

        {/* Start Time (Before) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t('start_before')}
          </label>
          <div className="relative">
            <Input
              type="datetime-local"
              value={filters.startBefore || ''}
              onChange={(e) =>
                handleFilterChange('startBefore', e.target.value)
              }
              className="h-9 text-xs pl-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
