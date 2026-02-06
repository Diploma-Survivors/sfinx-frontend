'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserProblemStats } from '@/types/user';
import { useTranslation } from 'react-i18next';

interface PracticeStatsCardProps {
    problemStats: UserProblemStats | null;
}

export function PracticeStatsCard({ problemStats }: PracticeStatsCardProps) {
    const { t } = useTranslation('profile');

    if (!problemStats) return null;

    return (
        <Card className="border border-border shadow-md">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                    {t('solved_problems')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <div className="text-4xl font-bold text-blue-600">
                            {problemStats.total.solved}{' '}
                            <span className="text-lg font-normal text-gray-400">
                                {t('problems')}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 border-t pt-2">
                        <div className="text-center">
                            <div className="text-sm font-medium text-green-600">
                                {t('easy')}
                            </div>
                            <div className="text-lg font-bold text-gray-700">
                                {problemStats.easy.solved}
                            </div>
                        </div>
                        <div className="border-l border-r text-center">
                            <div className="text-sm font-medium text-orange-600">
                                {t('medium')}
                            </div>
                            <div className="text-lg font-bold text-gray-700">
                                {problemStats.medium.solved}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-medium text-red-600">
                                {t('hard')}
                            </div>
                            <div className="text-lg font-bold text-gray-700">
                                {problemStats.hard.solved}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
