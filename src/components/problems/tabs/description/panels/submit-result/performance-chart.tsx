'use client';

import { SubmissionsService } from '@/services/submissions-service';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { DistributionChart, findUserBinIndex } from './distribution-chart';

interface PerformanceChartProps {
    submissionId: number;
    userAvatarUrl?: string;
    userRuntimeMs?: number;
    userMemoryKb?: number;
}

export function PerformanceChart({
    submissionId,
    userAvatarUrl,
    userRuntimeMs,
    userMemoryKb,
}: PerformanceChartProps) {
    const { t } = useTranslation('problems');

    const { data, isLoading, error } = useSWR(
        submissionId ? `/submissions/${submissionId}/performance-stats` : null,
        () => SubmissionsService.getPerformanceStats(submissionId).then(res => res.data.data),
        { revalidateOnFocus: false }
    );

    if (isLoading) {
        return (
            <div className="flex h-48 items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 p-8 mt-6">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
        );
    }

    if (error || !data || !data.distribution) return null;

    const { percentile, distribution } = data;

    const runtimeBinIndex = (userRuntimeMs !== undefined && distribution.runtime.length > 0)
        ? findUserBinIndex(distribution.runtime, userRuntimeMs)
        : -1;

    const memoryBinIndex = (userMemoryKb !== undefined && distribution.memory.length > 0)
        ? findUserBinIndex(distribution.memory, userMemoryKb)
        : -1;

    return (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 p-6 space-y-8">

            {/* Runtime Chart */}
            <div className="space-y-4">
                <div className="space-y-1">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-300">
                        {t('runtime_performance')}
                    </h3>
                </div>
                <div className="h-52 w-full">
                    <DistributionChart
                        distribution={distribution.runtime}
                        userBinIndex={runtimeBinIndex}
                        color="oklch(0.5 0.18 200)"
                        xTickFormatter={(v) => `${v.toFixed(2)} ms`}
                        tooltipFormatter={(min, max) => `${min.toFixed(2)} ms – ${max.toFixed(2)} ms`}
                        userAvatarUrl={userAvatarUrl}
                        unit="ms"
                    />
                </div>
            </div>

            <div className="w-full h-px bg-slate-200 dark:bg-slate-700" />

            {/* Memory Chart */}
            <div className="space-y-4">
                <div className="space-y-1">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-300">
                        {t('memory_performance')}
                    </h3>
                </div>
                <div className="h-52 w-full">
                    <DistributionChart
                        distribution={distribution.memory}
                        userBinIndex={memoryBinIndex}
                        color="oklch(0.55 0.18 160)"
                        xTickFormatter={(v) => `${(v / 1024).toFixed(1)} MB`}
                        tooltipFormatter={(min, max) => `${(min / 1024).toFixed(2)} MB – ${(max / 1024).toFixed(2)} MB`}
                        userAvatarUrl={userAvatarUrl}
                        unit="KB"
                    />
                </div>
            </div>

        </div>
    );
}
