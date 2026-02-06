'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tooltip } from '@/components/ui/tooltip';
import type { UserActivityCalendar } from '@/types/user';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface ActivityCalendarProps {
    activityCalendar: UserActivityCalendar | null;
    activityYears: number[];
    selectedYear: string;
    onYearChange: (year: string) => void;
}

export function ActivityCalendar({
    activityCalendar,
    activityYears,
    selectedYear,
    onYearChange,
}: ActivityCalendarProps) {
    const { t } = useTranslation('profile');

    if (!activityCalendar) return null;

    const { activeDays } = activityCalendar;
    const year = Number(selectedYear);
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const submissionMap = new Map<string, number>();
    activeDays.forEach((day) => submissionMap.set(day.date, day.count));

    const grid = [];
    const months = [];
    let currentMonth = -1;

    const startDay = startDate.getDay();
    const padding = startDay === 0 ? 6 : startDay - 1;

    for (let i = 0; i < padding; i++) {
        grid.push({ id: `pad-${i}`, isPadding: true, date: '', count: 0 });
    }

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = format(d, 'yyyy-MM-dd');
        const month = d.getMonth();

        if (month !== currentMonth) {
            const totalDays = grid.length;
            const weekIndex = Math.floor(totalDays / 7);
            months.push({ label: format(d, 'MMM'), weekIndex });
            currentMonth = month;
        }

        grid.push({
            id: dateStr,
            isPadding: false,
            date: dateStr,
            count: submissionMap.get(dateStr) || 0,
        });
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t('activity_calendar')}</h3>
                <Select value={selectedYear} onValueChange={onYearChange}>
                    <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                        {activityYears.map((y) => (
                            <SelectItem key={y} value={y.toString()}>
                                {y}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="relative overflow-x-auto pb-2">
                <div className="relative mb-2 ml-10 flex h-4 text-xs text-muted-foreground">
                    {months.map((m) => (
                        <div
                            key={m.label}
                            className="absolute"
                            style={{ left: `${m.weekIndex * 16}px` }}
                        >
                            {m.label}
                        </div>
                    ))}
                </div>

                <div className="flex gap-2">
                    <div className="flex flex-col gap-1 pt-[2px] text-[10px] text-muted-foreground">
                        <div className="h-3"></div>
                        <div className="h-3">Mon</div>
                        <div className="h-3"></div>
                        <div className="h-3">Wed</div>
                        <div className="h-3"></div>
                        <div className="h-3">Fri</div>
                        <div className="h-3"></div>
                    </div>

                    <div className="grid grid-flow-col grid-rows-7 gap-1">
                        {grid.map((cell) => (
                            <Tooltip
                                key={cell.id}
                                content={
                                    cell.isPadding
                                        ? ''
                                        : `${cell.count} submissions on ${cell.date}`
                                }
                            >
                                <div
                                    className={`h-3 w-3 rounded-sm ${cell.isPadding
                                            ? 'bg-transparent'
                                            : cell.count === 0
                                                ? 'bg-muted'
                                                : cell.count < 3
                                                    ? 'bg-green-300'
                                                    : cell.count < 6
                                                        ? 'bg-green-500'
                                                        : 'bg-green-700'
                                        }`}
                                />
                            </Tooltip>
                        ))}
                    </div>
                </div>
            </div>
            <div className="text-sm text-muted-foreground">
                {t('total_active_days')}: {activityCalendar.totalActiveDays}
            </div>
        </div>
    );
}
