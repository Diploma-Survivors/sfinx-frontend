'use client';

import type { UserRecentACProblem } from '@/types/user';
import { format } from 'date-fns';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface RecentActivityListProps {
    recentActivity: UserRecentACProblem[];
    onProblemClick: (problemId: number) => void;
}

export function RecentActivityList({
    recentActivity,
    onProblemClick,
}: RecentActivityListProps) {
    const { t } = useTranslation('profile');

    return (
        <div className="space-y-4">
            {recentActivity.map((activity) => (
                <div
                    key={new Date(activity.firstSolvedAt).getTime()}
                    className="flex cursor-pointer items-center justify-between rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted"
                    onClick={() => onProblemClick(activity.problemId)}
                >
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-green-100 p-2 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-medium text-foreground">
                                {activity.problem.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                {t('solved_on')}{' '}
                                {format(new Date(activity.firstSolvedAt), 'MMM d, yyyy')}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
