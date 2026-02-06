'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tooltip } from '@/components/ui/tooltip';
import {
    getDifficultyStyles,
    getStatusColor,
} from '@/components/profile/utils/difficulty-utils';
import { ProblemDifficulty, ProblemStatus } from '@/types/problems';
import type { UserPracticeHistoryItem } from '@/types/user';
import { format } from 'date-fns';
import {
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Circle,
    Clock,
    Cpu,
} from 'lucide-react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

interface PracticeHistoryTableProps {
    historyItems: UserPracticeHistoryItem[];
    expandedRows: Set<string>;
    currentPage: number;
    totalPages: number;
    onToggleRow: (problemId: string) => void;
    onProblemClick: (problemId: number) => void;
    onPageChange: (page: number) => void;
}

export function PracticeHistoryTable({
    historyItems,
    expandedRows,
    currentPage,
    totalPages,
    onToggleRow,
    onProblemClick,
    onPageChange,
}: PracticeHistoryTableProps) {
    const { t } = useTranslation('profile');

    return (
        <Card className="overflow-hidden border border-border shadow-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[180px]">{t('last_submitted')}</TableHead>
                        <TableHead>{t('problem')}</TableHead>
                        <TableHead>{t('latest_result')}</TableHead>
                        <TableHead className="text-right">{t('submissions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {historyItems.map((item) => (
                        <Fragment key={item.problem.id}>
                            <TableRow className="group">
                                <TableCell className="font-medium text-gray-500">
                                    {item.lastSubmittedAt
                                        ? format(new Date(item.lastSubmittedAt), 'MMM d, yyyy')
                                        : '-'}
                                </TableCell>
                                <TableCell>
                                    <div
                                        className="flex cursor-pointer items-start gap-3"
                                        onClick={() => onProblemClick(item.problem.id)}
                                    >
                                        {item.status === ProblemStatus.SOLVED ? (
                                            <Tooltip content={t('solved')}>
                                                <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
                                            </Tooltip>
                                        ) : (
                                            <Tooltip content={t('attempted')}>
                                                <Circle className="mt-0.5 h-5 w-5 text-gray-300" />
                                            </Tooltip>
                                        )}
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {item.problem.title}
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={`mt-1 border text-xs font-normal ${getDifficultyStyles(item.problem.difficulty)}`}
                                            >
                                                {item.problem.difficulty === ProblemDifficulty.EASY
                                                    ? t('easy')
                                                    : item.problem.difficulty === ProblemDifficulty.MEDIUM
                                                        ? t('medium')
                                                        : t('hard')}
                                            </Badge>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span
                                        className={`font-medium ${getStatusColor(item.lastResult)}`}
                                    >
                                        {t(item.lastResult)}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div
                                        className="flex cursor-pointer select-none items-center justify-end gap-2"
                                        onClick={() => onToggleRow(item.problem.id.toString())}
                                    >
                                        <span className="font-medium">{item.submissionCount}</span>
                                        {expandedRows.has(item.problem.id.toString()) ? (
                                            <ChevronUp className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-gray-400" />
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                            {expandedRows.has(item.problem.id.toString()) && (
                                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                    <TableCell colSpan={4} className="p-0">
                                        <div className="p-4 pl-12 pr-8">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-b border-gray-200">
                                                        <TableHead className="text-xs uppercase">
                                                            {t('time')}
                                                        </TableHead>
                                                        <TableHead className="text-xs uppercase">
                                                            {t('status')}
                                                        </TableHead>
                                                        <TableHead className="text-xs uppercase">
                                                            {t('language')}
                                                        </TableHead>
                                                        <TableHead className="text-xs uppercase">
                                                            {t('runtime')}
                                                        </TableHead>
                                                        <TableHead className="text-xs uppercase">
                                                            {t('memory')}
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {item.submissions.map((sub) => (
                                                        <TableRow
                                                            key={sub.id}
                                                            className="border-none hover:bg-transparent"
                                                        >
                                                            <TableCell className="text-gray-500">
                                                                {sub.submittedAt
                                                                    ? format(
                                                                        new Date(sub.submittedAt),
                                                                        'yyyy.MM.dd'
                                                                    )
                                                                    : '-'}
                                                            </TableCell>
                                                            <TableCell className={getStatusColor(sub.status)}>
                                                                {t(sub.status)}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                                >
                                                                    {sub.language?.name || t('unknown')}
                                                                </Badge>
                                                            </TableCell>

                                                            <TableCell className="text-gray-500">
                                                                <div className="flex items-center gap-2">
                                                                    <Clock className="h-4 w-4 text-gray-900" />
                                                                    <span>
                                                                        {sub.executionTime
                                                                            ? `${sub.executionTime} ms`
                                                                            : 'N/A'}
                                                                    </span>
                                                                </div>
                                                            </TableCell>

                                                            <TableCell className="text-gray-500">
                                                                <div className="flex items-center gap-2">
                                                                    <Cpu className="h-4 w-4 text-gray-900" />
                                                                    <span>
                                                                        {sub.memoryUsed
                                                                            ? `${sub.memoryUsed} MB`
                                                                            : 'N/A'}
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </Fragment>
                    ))}
                </TableBody>
            </Table>

            {totalPages > 1 && (
                <div className="flex justify-center border-t p-4">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                        >
                            {t('previous_page')}
                        </Button>
                        <span className="flex items-center px-4 text-sm text-gray-600">
                            {t('page_info', {
                                current: currentPage,
                                total: totalPages,
                            })}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                        >
                            {t('next_page')}
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}
