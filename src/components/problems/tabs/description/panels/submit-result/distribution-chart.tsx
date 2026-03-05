'use client';

import type { DistributionBin } from '@/types/submissions';
import { useTranslation } from 'react-i18next';
import {
    Bar,
    BarChart,
    Cell,
    LabelList,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { AvatarLabel } from './avatar-label';

export function findUserBinIndex(bins: DistributionBin[], userValue: number): number {
    return bins.findIndex(
        (bin) => userValue >= bin.min && userValue <= bin.max
    );
}

interface DistributionChartProps {
    distribution: DistributionBin[];
    userBinIndex: number;
    color: string;
    xTickFormatter: (value: number) => string;
    tooltipFormatter: (min: number, max: number) => string;
    userAvatarUrl?: string;
    unit: string;
}

export function DistributionChart({
    distribution,
    userBinIndex,
    color,
    xTickFormatter,
    tooltipFormatter,
    userAvatarUrl,
    unit,
}: DistributionChartProps) {
    const { t } = useTranslation('problems');

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distribution} margin={{ top: 36, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                    dataKey="min"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(value: number) => xTickFormatter(value)}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                />
                <YAxis
                    tickFormatter={(v) => `${v}`}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip
                    cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const entry = payload[0].payload as DistributionBin;
                            return (
                                <div className="bg-white dark:bg-slate-800 p-3 shadow-lg rounded-lg border border-slate-200 dark:border-slate-700">
                                    <p className="text-sm font-semibold">{tooltipFormatter(entry.min, entry.max)}</p>
                                    <p className="text-sm text-slate-500">{payload[0].value} {t('submissions')}</p>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {distribution.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={index === userBinIndex ? color : `${color}60`}
                        />
                    ))}
                    <LabelList
                        dataKey="count"
                        content={(props) => {
                            const { index } = props as { index?: number; x?: number; y?: number; width?: number; value?: number };
                            if (index !== userBinIndex || !userAvatarUrl) return null;
                            return (
                                <AvatarLabel
                                    {...(props as { x?: number; y?: number; width?: number; value?: number })}
                                    avatarUrl={userAvatarUrl}
                                />
                            );
                        }}
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
