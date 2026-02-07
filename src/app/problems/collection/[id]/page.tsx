'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import useSWR from 'swr';

import { Button } from '@/components/ui/button';
import { favoriteListService } from '@/services/favorite-list-service';
import type { FavoriteList } from '@/types/favorite-list';
import type { Problem } from '@/types/problems';
import { ProblemStatus } from '@/types/problems';
import FavoriteListOverview from '@/components/problems/favorite-list/favorite-list-overview';
import ProblemTable from '@/components/problems/problems-table/problems-table';
import ProblemListSkeleton from '@/components/problems/problem-list-skeleton';



export default function CollectionPage() {
    const params = useParams();
    const router = useRouter();
    const { t } = useTranslation('problems');
    const id = params.id as string;
    const listId = parseInt(id);

    const { data: list, isLoading: isListLoading, error: listError } = useSWR<FavoriteList>(
        listId ? `/favorite-lists/${listId}` : null,
        () => favoriteListService.getById(listId)
    );

    const { data: problems = [], isLoading: isProblemsLoading, error: problemsError } = useSWR<Problem[]>(
        listId ? `/favorite-lists/${listId}/problems` : null,
        () => favoriteListService.getProblems(listId)
    );

    const isLoading = isListLoading || isProblemsLoading;
    const error = listError || problemsError ? 'Failed to load collection.' : null;

    // Fetching handled by useSWR

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={() => router.back()}>{t('go_back', 'Go Back')}</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 lg:px-8 py-8 max-w-[1600px]">

                {/* Header / Back Button */}
                <div className="mb-6">
                    <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-primary" onClick={() => router.push('/problems')}>
                        <ArrowLeft className="h-4 w-4" />
                        {t('back_to_problems', 'Back to Problems')}
                    </Button>
                </div>

                {isLoading ? (
                    <ProblemListSkeleton />
                ) : list ? (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Column: List Info & Stats */}
                        <div className="w-full lg:w-[450px] shrink-0 space-y-8">
                            <FavoriteListOverview
                                list={list}
                                problems={problems}
                                onPractice={() => {
                                    const firstUnsolved = problems.find(
                                        (p) => p.status !== ProblemStatus.SOLVED
                                    );
                                    if (firstUnsolved) {
                                        router.push(`/problems/${firstUnsolved.id}`);
                                    } else if (problems.length > 0) {
                                        router.push(`/problems/${problems[0].id}`);
                                    }
                                }}
                            />
                        </div>

                        {/* Right Column: Problem Table */}
                        <div className="flex-1 min-w-0">
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                    {t('problems_in_list', 'Problems')}
                                </h1>
                            </div>
                            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                                <ProblemTable
                                    problems={problems}
                                    hasMore={false} // No pagination for now in this view
                                    onLoadMore={() => { }}
                                    isLoading={isLoading}
                                    totalCount={problems.length}
                                />
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
