'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip } from '@/components/ui/tooltip';
import { UserService } from '@/services/user-service';
import { ProblemDifficulty, ProblemStatus } from '@/types/problems';
import { SubmissionStatus } from '@/types/submissions';
import {
  PracticeHistorySortBy,
  PracticeHistorySortOrder,
  type UserPracticeHistoryItem,
  type UserProblemStats,
} from '@/types/user';
import { format } from 'date-fns';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  Cpu,
  Filter,
  Flame,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Fragment, use, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function PracticeHistoryPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId: userIdString } = use(params);
  const userId = Number(userIdString);
  const { t } = useTranslation('profile');

  const [loading, setLoading] = useState(true);
  const [historyItems, setHistoryItems] = useState<UserPracticeHistoryItem[]>(
    []
  );
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Stats
  const [problemStats, setProblemStats] = useState<UserProblemStats | null>(
    null
  );

  // Filtering
  const [statusFilter, setStatusFilter] = useState<ProblemStatus | 'ALL'>(
    'ALL'
  );
  const [difficultyFilter, setDifficultyFilter] = useState<
    ProblemDifficulty | 'ALL'
  >('ALL');

  // Sorting
  const [sortBy, setSortBy] = useState<PracticeHistorySortBy>(
    PracticeHistorySortBy.LAST_SUBMITTED_AT
  );
  const [sortOrder, setSortOrder] = useState<PracticeHistorySortOrder>(
    PracticeHistorySortOrder.DESC
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Expanded Rows
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [historyResponse, statsResponse] = await Promise.all([
          UserService.getUserPracticeHistory(userId, {
            page: currentPage,
            limit: itemsPerPage,
            status: statusFilter === 'ALL' ? undefined : statusFilter,
            difficulty:
              difficultyFilter === 'ALL' ? undefined : difficultyFilter,
            sortBy: sortBy,
            sortOrder: sortOrder,
          }),

          UserService.getUserStats(userId),
        ]);
        const historyData = historyResponse.data.data;
        const statsData = statsResponse.data.data;

        setHistoryItems(historyData.data);
        setTotalItems(historyData.meta.total);
        setTotalPages(historyData.meta.totalPages);
        setProblemStats(statsData.problemStats);
      } catch (error) {
        console.error('Error fetching practice history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, currentPage, statusFilter, difficultyFilter, sortBy, sortOrder]);

  const toggleRow = (problemId: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(problemId)) {
      newSet.delete(problemId);
    } else {
      newSet.add(problemId);
    }
    setExpandedRows(newSet);
  };

  const getDifficultyStyles = (diff: ProblemDifficulty) => {
    switch (diff) {
      case ProblemDifficulty.EASY:
        return 'text-green-600 bg-green-50 border-green-200';
      case ProblemDifficulty.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 border-orange-200';
      case ProblemDifficulty.HARD:
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: SubmissionStatus | ProblemStatus) => {
    if (
      status === ProblemStatus.SOLVED ||
      status === SubmissionStatus.ACCEPTED
    ) {
      return 'text-green-600';
    }
    if (
      status === SubmissionStatus.WRONG_ANSWER ||
      status === SubmissionStatus.TIME_LIMIT_EXCEEDED ||
      status === SubmissionStatus.RUNTIME_ERROR ||
      status === SubmissionStatus.COMPILATION_ERROR
    ) {
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  const router = useRouter();
  const handleProblemClick = (problemId: number) => {
    router.push(`/problems/${problemId}/submissions`);
  };

  if (loading && historyItems.length === 0) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
          {/* Left Section Skeleton */}
          <div className="col-span-1 lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-24" />
            </div>
            <Card className="border border-border shadow-md overflow-hidden">
              <div className="p-4 border-b">
                <div className="grid grid-cols-4 gap-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </div>
              <div className="p-4 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i + new Date().getTime()}
                    className="grid grid-cols-4 gap-4 items-center"
                  >
                    <Skeleton className="h-4 w-24" />
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-20" />
                    <div className="flex justify-end">
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Section Skeleton */}
          <div className="col-span-1 lg:col-span-4 space-y-6 pt-[52px]">
            <Card className="border border-border shadow-md gap-2">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <Skeleton className="h-10 w-16" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <Skeleton className="h-4 w-32 mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section: Practice History Table (70%) */}
        <div className="col-span-1 lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {t('practice_history')}
            </h1>
            <div className="flex items-center gap-2">
              <Select
                value={sortBy}
                onValueChange={(value) =>
                  setSortBy(value as PracticeHistorySortBy)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('sort_by')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PracticeHistorySortBy.LAST_SUBMITTED_AT}>
                    {t('last_submitted')}
                  </SelectItem>
                  <SelectItem value={PracticeHistorySortBy.SUBMISSION_COUNT}>
                    {t('submission_count')}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setSortOrder(
                    sortOrder === PracticeHistorySortOrder.ASC
                      ? PracticeHistorySortOrder.DESC
                      : PracticeHistorySortOrder.ASC
                  )
                }
                title={
                  sortOrder === PracticeHistorySortOrder.ASC
                    ? t('ascending')
                    : t('descending')
                }
              >
                {sortOrder === PracticeHistorySortOrder.ASC ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    {t('filter')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-4">
                  <div className="space-y-4">
                    {/* Status Filter */}
                    <div className="space-y-2">
                      <DropdownMenuLabel className="px-0 text-xs font-semibold text-gray-500 uppercase">
                        {t('status')}
                      </DropdownMenuLabel>
                      <div className="grid grid-cols-2 gap-2">
                        <div
                          className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors ${
                            statusFilter === ProblemStatus.SOLVED
                              ? 'bg-green-50 border-green-200 text-green-700'
                              : 'hover:bg-gray-50 border-gray-200 text-gray-600'
                          }`}
                          onClick={() =>
                            setStatusFilter(
                              statusFilter === ProblemStatus.SOLVED
                                ? 'ALL'
                                : ProblemStatus.SOLVED
                            )
                          }
                        >
                          <CheckCircle
                            className={`w-4 h-4 ${
                              statusFilter === ProblemStatus.SOLVED
                                ? 'text-green-600'
                                : 'text-gray-400'
                            }`}
                          />
                          <span className="text-sm font-medium">
                            {t('solved')}
                          </span>
                        </div>
                        <div
                          className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors ${
                            statusFilter === ProblemStatus.ATTEMPTED
                              ? 'bg-gray-100 border-gray-300 text-gray-900'
                              : 'hover:bg-gray-50 border-gray-200 text-gray-600'
                          }`}
                          onClick={() =>
                            setStatusFilter(
                              statusFilter === ProblemStatus.ATTEMPTED
                                ? 'ALL'
                                : ProblemStatus.ATTEMPTED
                            )
                          }
                        >
                          <Circle
                            className={`w-4 h-4 ${
                              statusFilter === ProblemStatus.ATTEMPTED
                                ? 'text-gray-900'
                                : 'text-gray-400'
                            }`}
                          />
                          <span className="text-sm font-medium">
                            {t('attempted')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <DropdownMenuSeparator />

                    {/* Difficulty Filter */}
                    <div className="space-y-2">
                      <DropdownMenuLabel className="px-0 text-xs font-semibold text-gray-500 uppercase">
                        {t('difficulty')}
                      </DropdownMenuLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          {
                            value: ProblemDifficulty.EASY,
                            label: t('easy'),
                            color: getDifficultyStyles(ProblemDifficulty.EASY),
                            hover: 'hover:bg-green-50/50',
                          },
                          {
                            value: ProblemDifficulty.MEDIUM,
                            label: t('medium'),
                            color: getDifficultyStyles(
                              ProblemDifficulty.MEDIUM
                            ),
                            hover: 'hover:bg-orange-50/50',
                          },
                          {
                            value: ProblemDifficulty.HARD,
                            label: t('hard'),
                            color: getDifficultyStyles(ProblemDifficulty.HARD),
                            hover: 'hover:bg-red-50/50',
                          },
                        ].map((diff) => {
                          const isSelected = difficultyFilter === diff.value;
                          return (
                            <div
                              key={diff.value}
                              className={`flex items-center justify-center p-2 rounded-md border cursor-pointer transition-all ${
                                isSelected
                                  ? diff.color
                                  : `border-gray-200 text-gray-500 ${diff.hover}`
                              }`}
                              onClick={() => {
                                setDifficultyFilter(
                                  isSelected ? 'ALL' : diff.value
                                );
                              }}
                            >
                              <span className="text-sm font-medium">
                                {diff.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <DropdownMenuSeparator />

                    {/* Reset Button */}
                    <Button
                      variant="ghost"
                      className="w-full text-gray-500 hover:text-gray-900"
                      onClick={() => {
                        setStatusFilter('ALL');
                        setDifficultyFilter('ALL');
                      }}
                    >
                      {t('reset_filters')}
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Card className="border border-border shadow-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">
                    {t('last_submitted')}
                  </TableHead>
                  <TableHead>{t('problem')}</TableHead>
                  <TableHead>{t('latest_result')}</TableHead>
                  <TableHead className="text-right">
                    {t('submissions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyItems.map((item) => (
                  <Fragment key={item.problem.id}>
                    <TableRow className="group ">
                      <TableCell className="text-gray-500 font-medium">
                        {item.lastSubmittedAt
                          ? format(
                              new Date(item.lastSubmittedAt),
                              'MMM d, yyyy'
                            )
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div
                          className="flex items-start gap-3 cursor-pointer"
                          onClick={() => handleProblemClick(item.problem.id)}
                        >
                          {item.status === ProblemStatus.SOLVED ? (
                            <Tooltip content={t('solved')}>
                              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                            </Tooltip>
                          ) : (
                            <Tooltip content={t('attempted')}>
                              <Circle className="w-5 h-5 text-gray-300 mt-0.5" />
                            </Tooltip>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {item.problem.title}
                            </div>
                            <Badge
                              variant="outline"
                              className={`mt-1 text-xs font-normal border ${getDifficultyStyles(item.problem.difficulty)}`}
                            >
                              {item.problem.difficulty ===
                              ProblemDifficulty.EASY
                                ? t('easy')
                                : item.problem.difficulty ===
                                    ProblemDifficulty.MEDIUM
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
                          className="flex items-center justify-end gap-2 cursor-pointer select-none"
                          onClick={() => toggleRow(item.problem.id.toString())}
                        >
                          <span className="font-medium">
                            {item.submissionCount}
                          </span>
                          {expandedRows.has(item.problem.id.toString()) ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
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
                                    <TableCell
                                      className={getStatusColor(sub.status)}
                                    >
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center p-4 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    {t('next_page')}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Section: Summary Sidebar (30%) */}
        <div className="col-span-1 lg:col-span-4 space-y-6 pt-[52px]">
          {/* Total Solved Card */}
          <Card className="border border-border shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-gray-500 text-sm font-medium">
                {t('solved_problems')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {problemStats && (
                <div className="space-y-4">
                  <div>
                    <div className="text-4xl font-bold text-blue-600">
                      {problemStats.total.solved}{' '}
                      <span className="text-lg text-gray-400 font-normal">
                        {t('problems')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                    <div className="text-center">
                      <div className="text-sm font-medium text-green-600">
                        {t('easy')}
                      </div>
                      <div className="text-lg font-bold text-gray-700">
                        {problemStats.easy.solved}
                      </div>
                    </div>
                    <div className="text-center border-l border-r">
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
