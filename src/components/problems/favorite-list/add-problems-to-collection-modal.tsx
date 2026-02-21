'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/providers/toast-provider';
import { favoriteListService } from '@/services/favorite-list-service';
import { ProblemsService } from '@/services/problems-service';
import { Problem, ProblemDifficulty, ProblemStatus, SortBy, SortOrder } from '@/types/problems';
import { Search, Loader2, CheckCircle2, Circle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from 'use-debounce';
import InfiniteScroll from 'react-infinite-scroll-component';

interface AddProblemsToCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    listId: number;
    currentProblemIds: number[];
    onSuccess?: () => void;
}

export function AddProblemsToCollectionModal({
    isOpen,
    onClose,
    listId,
    currentProblemIds,
    onSuccess,
}: AddProblemsToCollectionModalProps) {
    const { t } = useTranslation('problems');
    const { success, error } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [problems, setProblems] = useState<Problem[]>([]);
    const [selectedProblemIds, setSelectedProblemIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchProblems = async (query: string, pageNum: number) => {
        if (pageNum === 1) setIsLoading(true);
        try {
            const response = await ProblemsService.getProblemList({
                page: pageNum,
                limit: 20,
                search: query || undefined,
                sortBy: SortBy.ID,
                sortOrder: SortOrder.ASC,
            });
            const newProblems = response.data.data.data;
            const meta = response.data.data.meta;

            if (pageNum === 1) {
                setProblems(newProblems);
            } else {
                setProblems((prev) => [...prev, ...newProblems]);
            }
            setHasMore(meta.hasNextPage);
        } catch (err) {
            console.error('Failed to search problems:', err);
            error(t('failed_to_load_problems', 'Failed to load problems'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setPage(1);
            setHasMore(true);
            setProblems([]); 
            fetchProblems('', 1);
        }
    }, [isOpen]);

    const debouncedSearch = useDebouncedCallback((query: string) => {
        setPage(1);
        fetchProblems(query, 1);
    }, 500);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        debouncedSearch(query);
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProblems(searchQuery, nextPage);
    };

    const toggleProblemSelection = (problemId: number) => {
        setSelectedProblemIds((prev) =>
            prev.includes(problemId)
                ? prev.filter((id) => id !== problemId)
                : [...prev, problemId]
        );
    };

    const handleAddProblems = async () => {
        if (selectedProblemIds.length === 0) return;

        setIsAdding(true);
        try {
            await Promise.all(
                selectedProblemIds.map((problemId) =>
                    favoriteListService.addProblem(listId, problemId)
                )
            );
            success(t('problems_added', 'Problems added to collection'));
            onSuccess?.();
            onClose();
            // Reset state
            setSearchQuery('');
            setProblems([]);
            setSelectedProblemIds([]);
        } catch (err) {
            error(t('failed_to_add_problems', 'Failed to add problems'));
        } finally {
            setIsAdding(false);
        }
    };

    const getDifficultyColor = (difficulty: ProblemDifficulty) => {
        switch (difficulty) {
            case ProblemDifficulty.EASY:
                return 'text-green-500 bg-green-500/10';
            case ProblemDifficulty.MEDIUM:
                return 'text-yellow-500 bg-yellow-500/10';
            case ProblemDifficulty.HARD:
                return 'text-red-500 bg-red-500/10';
            default:
                return 'text-muted-foreground bg-muted';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="sm:max-w-2xl"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>{t('add_questions', 'Add Questions')}</DialogTitle>
                </DialogHeader>

                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('search_questions', 'Search questions...')}
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="pl-9"
                    />
                </div>

                <div
                    id="scrollableDiv"
                    className="h-[400px] overflow-y-auto pr-2 -mr-2"
                >
                    <InfiniteScroll
                        dataLength={problems.length}
                        next={loadMore}
                        hasMore={hasMore}
                        loader={
                            <div className="flex justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        }
                        endMessage={
                            problems.length > 0 && (
                                <p className="py-4 text-center text-sm text-muted-foreground">
                                    {t('no_more_questions', 'No more questions to load')}
                                </p>
                            )
                        }
                        scrollableTarget="scrollableDiv"
                        className="space-y-2 pr-2"
                    >
                        {problems.length > 0 ? (
                            problems.map((problem) => {
                                const isAlreadyInList = currentProblemIds.includes(problem.id);
                                const isSelected = selectedProblemIds.includes(problem.id);

                                return (
                                    <div
                                        key={problem.id}
                                        className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
                                    >
                                        <div className="flex flex-1 items-center gap-3 overflow-hidden pr-4">
                                            {problem.status === ProblemStatus.SOLVED ? (
                                                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                                            ) : problem.status === ProblemStatus.ATTEMPTED ? (
                                                <Circle className="h-4 w-4 shrink-0 text-muted-foreground/30" />
                                            ) : (
                                                <div className="h-4 w-4 shrink-0" />
                                            )}
                                            <span className="truncate text-base font-medium">
                                                {problem.id}. {problem.title}
                                            </span>
                                            <span
                                                className={`rounded px-2 py-0.5 text-xs font-medium ${getDifficultyColor(
                                                    problem.difficulty
                                                )}`}
                                            >
                                                {problem.difficulty}
                                            </span>
                                        </div>
                                        {isAlreadyInList ? (
                                            <Checkbox
                                                checked={isAlreadyInList}
                                                onCheckedChange={() => toggleProblemSelection(problem.id)}
                                                className="h-5 w-5"
                                                disabled={true}
                                            />
                                        ) : (
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => toggleProblemSelection(problem.id)}
                                                className="h-5 w-5"
                                            />
                                        )}
                                    </div>
                                );
                            })
                        ) : !isLoading && (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                {searchQuery
                                    ? t('no_results', 'No results found')
                                    : t('start_typing', 'Start typing to search for questions')}
                            </div>
                        )}
                        {isLoading && problems.length === 0 && (
                            <div className="flex justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        )}
                    </InfiniteScroll>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        {t('cancel', 'Cancel')}
                    </Button>
                    <Button
                        onClick={handleAddProblems}
                        disabled={selectedProblemIds.length === 0 || isAdding}
                    >
                        {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('add_to_list', 'Add to List')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
