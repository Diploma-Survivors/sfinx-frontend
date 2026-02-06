'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { getDifficultyStyles } from '@/components/profile/utils/difficulty-utils';
import { ProblemDifficulty, ProblemStatus } from '@/types/problems';
import {
    PracticeHistorySortBy,
    PracticeHistorySortOrder,
} from '@/types/user';
import {
    ArrowDown,
    ArrowUp,
    CheckCircle,
    Circle,
    Filter,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PracticeFiltersProps {
    statusFilter: ProblemStatus | 'ALL';
    difficultyFilter: ProblemDifficulty | 'ALL';
    sortBy: PracticeHistorySortBy;
    sortOrder: PracticeHistorySortOrder;
    onStatusChange: (status: ProblemStatus | 'ALL') => void;
    onDifficultyChange: (difficulty: ProblemDifficulty | 'ALL') => void;
    onSortByChange: (sortBy: PracticeHistorySortBy) => void;
    onSortOrderChange: (order: PracticeHistorySortOrder) => void;
    onResetFilters: () => void;
}

export function PracticeFilters({
    statusFilter,
    difficultyFilter,
    sortBy,
    sortOrder,
    onStatusChange,
    onDifficultyChange,
    onSortByChange,
    onSortOrderChange,
    onResetFilters,
}: PracticeFiltersProps) {
    const { t } = useTranslation('profile');

    return (
        <div className="flex items-center gap-2">
            <Select
                value={sortBy}
                onValueChange={(value) => onSortByChange(value as PracticeHistorySortBy)}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('sort_by')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={PracticeHistorySortBy.LAST_SUBMITTED_AT}>
                        {t('last_submitted')}
                    </SelectItem>
                    <SelectItem value={PracticeHistorySortBy.SUBMISSION_COUNT}>
                        {t('submission_count')}
                    </SelectItem>
                </SelectContent>
            </Select>

            <Button
                variant="outline"
                size="icon"
                onClick={() =>
                    onSortOrderChange(
                        sortOrder === PracticeHistorySortOrder.ASC
                            ? PracticeHistorySortOrder.DESC
                            : PracticeHistorySortOrder.ASC
                    )
                }
                title={
                    sortOrder === PracticeHistorySortOrder.ASC
                        ? t('ascending')
                        : t('descending')
                }
            >
                {sortOrder === PracticeHistorySortOrder.ASC ? (
                    <ArrowUp className="h-4 w-4" />
                ) : (
                    <ArrowDown className="h-4 w-4" />
                )}
            </Button>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        {t('filter')}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <DropdownMenuLabel className="px-0 text-xs font-semibold uppercase text-gray-500">
                                {t('status')}
                            </DropdownMenuLabel>
                            <div className="grid grid-cols-2 gap-2">
                                <div
                                    className={`flex cursor-pointer items-center gap-2 rounded-md border p-2 transition-colors ${statusFilter === ProblemStatus.SOLVED
                                            ? 'border-green-200 bg-green-50 text-green-700'
                                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    onClick={() =>
                                        onStatusChange(
                                            statusFilter === ProblemStatus.SOLVED
                                                ? 'ALL'
                                                : ProblemStatus.SOLVED
                                        )
                                    }
                                >
                                    <CheckCircle
                                        className={`h-4 w-4 ${statusFilter === ProblemStatus.SOLVED
                                                ? 'text-green-600'
                                                : 'text-gray-400'
                                            }`}
                                    />
                                    <span className="text-sm font-medium">{t('solved')}</span>
                                </div>
                                <div
                                    className={`flex cursor-pointer items-center gap-2 rounded-md border p-2 transition-colors ${statusFilter === ProblemStatus.ATTEMPTED
                                            ? 'border-gray-300 bg-gray-100 text-gray-900'
                                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    onClick={() =>
                                        onStatusChange(
                                            statusFilter === ProblemStatus.ATTEMPTED
                                                ? 'ALL'
                                                : ProblemStatus.ATTEMPTED
                                        )
                                    }
                                >
                                    <Circle
                                        className={`h-4 w-4 ${statusFilter === ProblemStatus.ATTEMPTED
                                                ? 'text-gray-900'
                                                : 'text-gray-400'
                                            }`}
                                    />
                                    <span className="text-sm font-medium">{t('attempted')}</span>
                                </div>
                            </div>
                        </div>

                        <DropdownMenuSeparator />

                        <div className="space-y-2">
                            <DropdownMenuLabel className="px-0 text-xs font-semibold uppercase text-gray-500">
                                {t('difficulty')}
                            </DropdownMenuLabel>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    {
                                        value: ProblemDifficulty.EASY,
                                        label: t('easy'),
                                        color: getDifficultyStyles(ProblemDifficulty.EASY),
                                        hover: 'hover:bg-green-50/50',
                                    },
                                    {
                                        value: ProblemDifficulty.MEDIUM,
                                        label: t('medium'),
                                        color: getDifficultyStyles(ProblemDifficulty.MEDIUM),
                                        hover: 'hover:bg-orange-50/50',
                                    },
                                    {
                                        value: ProblemDifficulty.HARD,
                                        label: t('hard'),
                                        color: getDifficultyStyles(ProblemDifficulty.HARD),
                                        hover: 'hover:bg-red-50/50',
                                    },
                                ].map((diff) => {
                                    const isSelected = difficultyFilter === diff.value;
                                    return (
                                        <div
                                            key={diff.value}
                                            className={`flex cursor-pointer items-center justify-center rounded-md border p-2 transition-all ${isSelected
                                                    ? diff.color
                                                    : `border-gray-200 text-gray-500 ${diff.hover}`
                                                }`}
                                            onClick={() => {
                                                onDifficultyChange(isSelected ? 'ALL' : diff.value);
                                            }}
                                        >
                                            <span className="text-sm font-medium">{diff.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <DropdownMenuSeparator />

                        <Button
                            variant="ghost"
                            className="w-full text-gray-500 hover:text-gray-900"
                            onClick={onResetFilters}
                        >
                            {t('reset_filters')}
                        </Button>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
