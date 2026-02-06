'use client';

import SolutionItem from '@/components/problems/tabs/solutions/solution-item';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { Solution, SolutionSortBy } from '@/types/solutions';
import { Loader2, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SolutionsListProps {
    solutions: Solution[];
    loading: boolean;
    currentPage: number;
    totalPages: number;
    sortBy: SolutionSortBy;
    onPageChange: (page: number) => void;
    onSortChange: (sortBy: SolutionSortBy) => void;
    onSolutionClick: (solutionId: string) => void;
}

export function SolutionsList({
    solutions,
    loading,
    currentPage,
    totalPages,
    sortBy,
    onPageChange,
    onSortChange,
    onSolutionClick,
}: SolutionsListProps) {
    const { t } = useTranslation('profile');

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder={t('search_solutions')}
                        className="pl-10"
                        disabled
                    />
                </div>
                <Select
                    value={sortBy}
                    onValueChange={(value) => onSortChange(value as SolutionSortBy)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={t('sort_by')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="recent">{t('most_recent')}</SelectItem>
                        <SelectItem value="votes">{t('most_votes')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
            ) : solutions.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                    {t('no_solutions')}
                </div>
            ) : (
                <div className="space-y-4">
                    {solutions.map((solution) => (
                        <SolutionItem
                            key={solution.id}
                            solution={solution}
                            isSelected={false}
                            onClick={() => onSolutionClick(solution.id)}
                        />
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                    >
                        {t('previous')}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        {t('page')} {currentPage} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || loading}
                    >
                        {t('next')}
                    </Button>
                </div>
            )}
        </div>
    );
}
