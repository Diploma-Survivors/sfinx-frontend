'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import { SubmissionStatus } from '@/types/submissions';
import type { UserSubmissionStats } from '@/types/user';
import { useTranslation } from 'react-i18next';

interface SubmissionStatsCardProps {
    submissionStats: UserSubmissionStats | null;
}

export function SubmissionStatsCard({
    submissionStats,
}: SubmissionStatsCardProps) {
    const { t } = useTranslation('profile');

    if (!submissionStats) return null;

    const total = submissionStats.total || 1;
    const data = [
        {
            status: SubmissionStatus.ACCEPTED,
            count: submissionStats.accepted,
            color: '#10b981',
        },
        {
            status: SubmissionStatus.WRONG_ANSWER,
            count: submissionStats.wrongAnswer,
            color: '#ef4444',
        },
        {
            status: SubmissionStatus.TIME_LIMIT_EXCEEDED,
            count: submissionStats.timeLimitExceeded,
            color: '#eab308',
        },
        {
            status: SubmissionStatus.RUNTIME_ERROR,
            count: submissionStats.runtimeError,
            color: '#f97316',
        },
        {
            status: 'others',
            count: submissionStats.others + submissionStats.compilationError,
            color: '#6b7280',
        },
    ];

    let cumulativePercent = 0;

    return (
        <Card className="border border-border bg-card shadow-md">
            <CardHeader>
                <CardTitle>{t('submission_stats')}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
                <div className="relative h-32 w-32">
                    <svg viewBox="0 0 32 32" className="h-full w-full -rotate-90 transform">
                        <title>{t('submission_status_chart')}</title>
                        {data.map((item) => {
                            if (item.count === 0) return null;

                            const percent = (item.count / total) * 100;
                            const startPercent = cumulativePercent;
                            cumulativePercent += percent;

                            const x1 = 16 + 16 * Math.cos((2 * Math.PI * startPercent) / 100);
                            const y1 = 16 + 16 * Math.sin((2 * Math.PI * startPercent) / 100);
                            const x2 =
                                16 + 16 * Math.cos((2 * Math.PI * cumulativePercent) / 100);
                            const y2 =
                                16 + 16 * Math.sin((2 * Math.PI * cumulativePercent) / 100);

                            const largeArcFlag = percent > 50 ? 1 : 0;

                            if (percent > 99.9) {
                                return (
                                    <circle
                                        key={item.status}
                                        cx="16"
                                        cy="16"
                                        r="16"
                                        fill={item.color}
                                    />
                                );
                            }

                            return (
                                <Tooltip
                                    key={item.status}
                                    content={`${item.status === 'others' ? t('others') : item.status}: ${percent.toFixed(1)}%`}
                                >
                                    <path
                                        d={`M 16 16 L ${x1} ${y1} A 16 16 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                                        fill={item.color}
                                        className="cursor-pointer transition-opacity hover:opacity-80"
                                    />
                                </Tooltip>
                            );
                        })}
                    </svg>
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <span className="text-muted-foreground">{t('accepted')}:</span>
                        <span className="font-bold">{submissionStats.accepted}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <span className="text-muted-foreground">{t('wrong_answer')}:</span>
                        <span className="font-bold">{submissionStats.wrongAnswer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <span className="text-muted-foreground">{t('time_limit')}:</span>
                        <span className="font-bold">
                            {submissionStats.timeLimitExceeded}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-orange-500" />
                        <span className="text-muted-foreground">{t('runtime_error')}:</span>
                        <span className="font-bold">{submissionStats.runtimeError}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-gray-500" />
                        <span className="text-muted-foreground">{t('others')}:</span>
                        <span className="font-bold">
                            {submissionStats.others + submissionStats.compilationError}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
