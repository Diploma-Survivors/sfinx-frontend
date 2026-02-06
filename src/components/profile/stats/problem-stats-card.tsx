'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import type { UserProblemStats } from '@/types/user';
import { useTranslation } from 'react-i18next';

interface ProblemStatsCardProps {
    problemStats: UserProblemStats | null;
}

export function ProblemStatsCard({ problemStats }: ProblemStatsCardProps) {
    const { t } = useTranslation('profile');

    if (!problemStats) return null;

    const totalPercentage =
        (problemStats.total.solved / (problemStats.total.total || 1)) * 100;

    return (
        <Card className="border border-border bg-card shadow-md">
            <CardHeader>
                <CardTitle>{t('solved_problems')}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center space-x-8">
                <Tooltip content={`${totalPercentage.toFixed(1)}%`}>
                    <div className="relative flex h-32 w-32 cursor-pointer items-center justify-center">
                        <svg viewBox="0 0 36 36" className="h-full w-full">
                            <title>{t('solved_problems_chart')}</title>
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                className="text-muted"
                                strokeWidth="3"
                            />
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="3"
                                strokeDasharray={`${totalPercentage}, 100`}
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-2xl font-bold text-foreground">
                                {problemStats.total.solved}/{problemStats.total.total}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {t('solved')}
                            </span>
                        </div>
                    </div>
                </Tooltip>

                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-green-600">{t('easy')}</span>
                        <span className="font-bold">
                            {problemStats.easy.solved}
                            <span className="font-normal text-muted-foreground">
                                /{problemStats.easy.total}
                            </span>
                        </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                        <div
                            className="h-2 rounded-full bg-green-500"
                            style={{
                                width: `${(problemStats.easy.solved / (problemStats.easy.total || 1)) * 100}%`,
                            }}
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-yellow-600">{t('medium')}</span>
                        <span className="font-bold">
                            {problemStats.medium.solved}
                            <span className="font-normal text-muted-foreground">
                                /{problemStats.medium.total}
                            </span>
                        </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                        <div
                            className="h-2 rounded-full bg-yellow-500"
                            style={{
                                width: `${(problemStats.medium.solved / (problemStats.medium.total || 1)) * 100}%`,
                            }}
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-red-600">{t('hard')}</span>
                        <span className="font-bold">
                            {problemStats.hard.solved}
                            <span className="font-normal text-muted-foreground">
                                /{problemStats.hard.total}
                            </span>
                        </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                        <div
                            className="h-2 rounded-full bg-red-500"
                            style={{
                                width: `${(problemStats.hard.solved / (problemStats.hard.total || 1)) * 100}%`,
                            }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
