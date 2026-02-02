'use client';

import SolutionItem from '@/components/problems/tabs/solutions/solution-item';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip } from '@/components/ui/tooltip';
import { useApp } from '@/contexts/app-context';
import { UserService } from '@/services/user-service';
import { ProblemDifficulty, type ProblemListItem } from '@/types/problems';
import { type Solution, SolutionSortBy } from '@/types/solutions';
import { type Submission, SubmissionStatus } from '@/types/submissions';
import type {
  UserActivityCalendar,
  UserProblemStats,
  UserRecentACProblem,
  UserSubmissionStats,
  UserProfile,
} from '@/types/user';
import { format } from 'date-fns';
import {
  ArrowRight,
  Calendar,
  Clock,
  Edit,
  Github,
  Globe,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  ThumbsDown,
  ThumbsUp,
  Trophy,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type MonthKey =
  | 'Jan'
  | 'Feb'
  | 'Mar'
  | 'Apr'
  | 'May'
  | 'Jun'
  | 'Jul'
  | 'Aug'
  | 'Sep'
  | 'Oct'
  | 'Nov'
  | 'Dec';

const monthWidths: Record<string, number> = {
  Jan: 82,
  Feb: 63,
  Mar: 70,
  Apr: 62,
  May: 75,
  Jun: 70,
  Jul: 70,
  Aug: 70,
  Sep: 73,
  Oct: 65,
  Nov: 65,
  Dec: 65,
};

export default function ProfilePage({
  params,
}: { params: Promise<{ userId: string }> }) {
  const { t, i18n } = useTranslation('profile');
  const { userId: userIdString } = use(params);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // New State for Backend Data
  const [problemStats, setProblemStats] = useState<UserProblemStats | null>(
    null
  );
  const [submissionStats, setSubmissionStats] =
    useState<UserSubmissionStats | null>(null);
  const [activityCalendar, setActivityCalendar] =
    useState<UserActivityCalendar | null>(null);
  const [recentActivity, setRecentActivity] = useState<UserRecentACProblem[]>(
    []
  );
  const [activityYears, setActivityYears] = useState<number[]>([]);

  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );

  // Solutions Tab State
  const [userSolutions, setUserSolutions] = useState<Solution[]>([]);
  const [solutionsLoading, setSolutionsLoading] = useState(false);
  const [solutionsPage, setSolutionsPage] = useState(1);
  const [totalSolutions, setTotalSolutions] = useState(0);
  const [totalSolutionsPages, setTotalSolutionsPages] = useState(0);
  const solutionsPerPage = 10;
  const [solutionsSortBy, setSolutionsSortBy] = useState<SolutionSortBy>(
    SolutionSortBy.RECENT
  );

  const router = useRouter();
  const { user: currentUser } = useApp();
  const isCurrentUser = currentUser?.id === Number(userIdString);

  const fetchUserSolutions = useCallback(
    async (userId: number, page: number, sortBy: SolutionSortBy) => {
      setSolutionsLoading(true);
      try {
        const response = await UserService.getUserSolutions(userId, {
          page,
          limit: solutionsPerPage,
          sortBy,
        });
        setUserSolutions(response.data.data.data);
        setTotalSolutions(response.data.data.meta.total);
        setTotalSolutionsPages(response.data.data.meta.totalPages);
      } catch (error) {
        console.error('Error fetching user solutions:', error);
      } finally {
        setSolutionsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = Number(userIdString);

        // Fetch initial data (user, stats, years, recent activity)
        const [userRes, statsRes, yearsRes, recentRes] = await Promise.all([
          UserService.getUserProfile(userId),
          UserService.getUserStats(userId),
          UserService.getUserActivityYears(userId),
          UserService.getUserRecentACProblems(userId),
        ]);

        setUser(userRes.data.data);
        setProblemStats(statsRes.data.data.problemStats);
        setSubmissionStats(statsRes.data.data.submissionStats);
        setActivityYears(yearsRes.data.data);
        setRecentActivity(recentRes.data.data);

        // Fetch initial user solutions
        fetchUserSolutions(userId, solutionsPage, solutionsSortBy);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userIdString, fetchUserSolutions]); // Added fetchUserSolutions to deps, but it's useCallback'd

  // Fetch calendar when year changes
  useEffect(() => {
    const fetchCalendar = async () => {
      if (!userIdString) return;
      try {
        const userId = Number(userIdString);
        const year = Number(selectedYear);
        const response = await UserService.getUserActivityCalendar(
          userId,
          year
        );
        setActivityCalendar(response.data.data);
      } catch (error) {
        console.error('Error fetching activity calendar:', error);
      }
    };

    fetchCalendar();
  }, [userIdString, selectedYear]);

  // Fetch solutions when page or sort changes
  useEffect(() => {
    if (!userIdString) return;
    fetchUserSolutions(Number(userIdString), solutionsPage, solutionsSortBy);
  }, [userIdString, solutionsPage, solutionsSortBy, fetchUserSolutions]);

  const handleSaveProfile = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    // In a real app, we would call an API to update the user here
  };

  const handleProblemClick = (problemId: number) => {
    router.push(`/problems/${problemId}/description`);
  };

  const handleSolutionClick = (solutionId: string) => {
    const solution = userSolutions.find((s) => s.id === solutionId);
    if (solution) {
      router.push(`/problems/${solution.problemId}/solutions/${solutionId}`);
    }
  };

  // Heatmap Rendering Logic
  const renderHeatmap = () => {
    if (!activityCalendar) return null;

    const { activeDays } = activityCalendar;
    const year = Number(selectedYear);
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    // Create a map for quick lookup
    const submissionMap = new Map<string, number>();
    activeDays.forEach((day) => submissionMap.set(day.date, day.count));

    const grid = [];
    const months = [];
    let currentMonth = -1;

    // Pad start to align with Monday
    const startDay = startDate.getDay(); // 0 is Sunday
    const padding = startDay === 0 ? 6 : startDay - 1;

    for (let i = 0; i < padding; i++) {
      grid.push({ id: `pad-${i}`, isPadding: true, date: '', count: 0 });
    }

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = format(d, 'yyyy-MM-dd');
      const month = d.getMonth();

      if (month !== currentMonth) {
        // Calculate week index for month label positioning
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
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{t('activity_calendar')}</h3>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
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
          {/* Month Labels */}
          <div className="flex text-xs text-muted-foreground mb-2 relative h-4 ml-10">
            {months.map((m, i) => (
              <div
                key={m.label}
                className="absolute"
                style={{ left: `${m.weekIndex * 16}px` }} // Approx 14px per cell+gap
              >
                {m.label}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {/* Day Labels */}
            <div className="flex flex-col gap-1 text-[10px] text-muted-foreground pt-[2px]">
              <div className="h-3"></div>
              <div className="h-3">Mon</div>
              <div className="h-3"></div>
              <div className="h-3">Wed</div>
              <div className="h-3"></div>
              <div className="h-3">Fri</div>
              <div className="h-3"></div>
            </div>

            {/* Grid */}
            <div className="grid grid-rows-7 grid-flow-col gap-1">
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
                    className={`w-3 h-3 rounded-sm ${
                      cell.isPadding
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
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
          <div className="col-span-12 lg:col-span-9 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-[300px] w-full rounded-xl" />
              <Skeleton className="h-[300px] w-full rounded-xl" />
            </div>
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <div>User not found</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: User Profile Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <Card className="shadow-lg border border-border bg-card">
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Avatar className="w-32 h-32 rounded-xl border-4 border-background shadow-md">
                  <AvatarImage src={user.avatarUrl} className="object-cover" />
                  <AvatarFallback className="rounded-xl">
                    <img
                      src="/avatars/placeholder.png"
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {user.fullName}
                </h2>
                <p className="text-muted-foreground font-medium">
                  {user.username}
                </p>
              </div>
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-3 py-1"
              >
                <Trophy className="w-3 h-3 mr-1" />
                {`${t('rank')} ${user.rank}`}
              </Badge>

              {isCurrentUser && (
                <Button
                  className="w-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                  onClick={() => router.push('/settings')}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {t('edit_profile')}
                </Button>
              )}

              <div className="w-full space-y-3 pt-4 text-left">
                {user.bio && (
                  <div className="text-sm text-muted-foreground italic border-l-2 border-primary/20 pl-3 py-1 mb-4">
                    {user.bio}
                  </div>
                )}

                {user.address && (
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-3 text-muted-foreground/70" />
                    <span className="text-sm truncate">{user.address}</span>
                  </div>
                )}
                {user.email && (
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="w-4 h-4 mr-3 text-muted-foreground/70" />
                    <span className="text-sm truncate">{user.email}</span>
                  </div>
                )}
                {user.phone && (
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="w-4 h-4 mr-3 text-muted-foreground/70" />
                    <span className="text-sm truncate">{user.phone}</span>
                  </div>
                )}

                {user.githubUsername && (
                  <a
                    href={`https://github.com/${user.githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Github className="w-4 h-4 mr-3 text-muted-foreground/70" />
                    <span className="text-sm truncate">
                      @{user.githubUsername}
                    </span>
                  </a>
                )}

                {user.linkedinUrl && (
                  <a
                    href={user.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Linkedin className="w-4 h-4 mr-3 text-muted-foreground/70" />
                    <span className="text-sm truncate">LinkedIn</span>
                  </a>
                )}

                {user.websiteUrl && (
                  <a
                    href={user.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Globe className="w-4 h-4 mr-3 text-muted-foreground/70" />
                    <span className="text-sm truncate">Website</span>
                  </a>
                )}

                <div className="flex items-center text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-3 text-muted-foreground/70" />
                  <span className="text-sm truncate">{`${t('joined')} Dec 2024`}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Stats, Heatmap, Activity */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Solved Problems Chart */}
            <Card className="border border-border shadow-md bg-card">
              <CardHeader>
                <CardTitle>{t('solved_problems')}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center space-x-8">
                {problemStats && (
                  <>
                    <Tooltip
                      content={`${((problemStats.total.solved / (problemStats.total.total || 1)) * 100).toFixed(1)}%`}
                    >
                      <div className="relative w-32 h-32 flex items-center justify-center cursor-pointer">
                        <svg viewBox="0 0 36 36" className="w-full h-full">
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
                            strokeDasharray={`${(problemStats.total.solved / (problemStats.total.total || 1)) * 100}, 100`}
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-2xl font-bold text-foreground">
                            {problemStats.total.solved}/
                            {problemStats.total.total}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {t('solved')}
                          </span>
                        </div>
                      </div>
                    </Tooltip>

                    <div className="space-y-2 flex-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-green-600 font-medium">
                          {t('easy')}
                        </span>
                        <span className="font-bold">
                          {problemStats.easy.solved}
                          <span className="text-muted-foreground font-normal">
                            /{problemStats.easy.total}
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${(problemStats.easy.solved / (problemStats.easy.total || 1)) * 100}%`,
                          }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-yellow-600 font-medium">
                          {t('medium')}
                        </span>
                        <span className="font-bold">
                          {problemStats.medium.solved}
                          <span className="text-muted-foreground font-normal">
                            /{problemStats.medium.total}
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{
                            width: `${(problemStats.medium.solved / (problemStats.medium.total || 1)) * 100}%`,
                          }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-red-600 font-medium">
                          {t('hard')}
                        </span>
                        <span className="font-bold">
                          {problemStats.hard.solved}
                          <span className="text-muted-foreground font-normal">
                            /{problemStats.hard.total}
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{
                            width: `${(problemStats.hard.solved / (problemStats.hard.total || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Submission Status Chart */}
            <Card className="border border-border shadow-md bg-card">
              <CardHeader>
                <CardTitle>{t('submission_stats')}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                {submissionStats && (
                  <>
                    {/* Pie Chart */}
                    <div className="relative w-32 h-32">
                      <svg
                        viewBox="0 0 32 32"
                        className="w-full h-full transform -rotate-90"
                      >
                        <title>{t('submission_status_chart')}</title>
                        {(() => {
                          const total = submissionStats.total || 1;
                          let cumulativePercent = 0;
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
                              count:
                                submissionStats.others +
                                submissionStats.compilationError,
                              color: '#6b7280',
                            },
                          ];

                          return data.map((item) => {
                            if (item.count === 0) return null;

                            const percent = (item.count / total) * 100;
                            const startPercent = cumulativePercent;
                            cumulativePercent += percent;

                            // Calculate SVG path for pie slice
                            const x1 =
                              16 +
                              16 * Math.cos((2 * Math.PI * startPercent) / 100);
                            const y1 =
                              16 +
                              16 * Math.sin((2 * Math.PI * startPercent) / 100);
                            const x2 =
                              16 +
                              16 *
                                Math.cos(
                                  (2 * Math.PI * cumulativePercent) / 100
                                );
                            const y2 =
                              16 +
                              16 *
                                Math.sin(
                                  (2 * Math.PI * cumulativePercent) / 100
                                );

                            const largeArcFlag = percent > 50 ? 1 : 0;

                            // Handle 100% case
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
                                  className="cursor-pointer hover:opacity-80 transition-opacity"
                                />
                              </Tooltip>
                            );
                          });
                        })()}
                      </svg>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-muted-foreground">
                          {t('accepted')}:
                        </span>
                        <span className="font-bold">
                          {submissionStats.accepted}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-muted-foreground">
                          {t('wrong_answer')}:
                        </span>
                        <span className="font-bold">
                          {submissionStats.wrongAnswer}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-muted-foreground">
                          {t('time_limit')}:
                        </span>
                        <span className="font-bold">
                          {submissionStats.timeLimitExceeded}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <span className="text-muted-foreground">
                          {t('runtime_error')}:
                        </span>
                        <span className="font-bold">
                          {submissionStats.runtimeError}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-500" />
                        <span className="text-muted-foreground">
                          {t('others')}:
                        </span>
                        <span className="font-bold">
                          {submissionStats.others +
                            submissionStats.compilationError}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Heatmap */}
          <Card className="border border-border shadow-md bg-card">
            <CardContent className="pt-6">{renderHeatmap()}</CardContent>
          </Card>

          {/* Tabs: Recent AC & Solutions */}
          <Tabs defaultValue="recent-ac" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="recent-ac">
                {t('recent_ac_problems')}
              </TabsTrigger>
              <TabsTrigger value="solutions">{t('solutions')}</TabsTrigger>
            </TabsList>

            <TabsContent value="recent-ac" className="mt-6">
              <Card className="border border-border shadow-md bg-card">
                <CardHeader>
                  <CardTitle>{t('recent_ac_problems')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={new Date(activity.firstSolvedAt).getTime()}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => handleProblemClick(activity.problemId)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-green-100 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">
                              {activity.problem.title}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>
                                {format(
                                  new Date(activity.firstSolvedAt),
                                  'MMM d, yyyy'
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    ))}
                    {recentActivity.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        {t('no_recent_activity')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="solutions" className="mt-6">
              <Card className="border border-border shadow-md bg-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{t('solutions')}</CardTitle>
                  <div className="flex items-center gap-4">
                    <Select
                      value={solutionsSortBy}
                      onValueChange={(value) =>
                        setSolutionsSortBy(value as SolutionSortBy)
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={t('sort_by')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SolutionSortBy.RECENT}>
                          {t('most_recent')}
                        </SelectItem>
                        <SelectItem value={SolutionSortBy.MOST_VOTED}>
                          {t('most_voted')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {solutionsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : userSolutions.length > 0 ? (
                    <div className="space-y-4">
                      {userSolutions.map((solution) => (
                        <div
                          key={solution.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                          onClick={() => handleSolutionClick(solution.id)}
                        >
                          <div className="space-y-1">
                            <h4 className="font-medium text-foreground hover:text-primary transition-colors">
                              {solution.title}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>
                                {format(
                                  new Date(solution.createdAt),
                                  'MMM d, yyyy'
                                )}
                              </span>
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" />
                                {solution.upvoteCount}
                              </span>
                              <span className="flex items-center gap-1">
                                <ThumbsDown className="w-3 h-3" />
                                {solution.downvoteCount}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {solution.commentCount}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {t('no_solutions_found')}
                    </div>
                  )}

                  {/* Solutions Pagination */}
                  {totalSolutionsPages > 1 && (
                    <div className="flex justify-center mt-6 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSolutionsPage((p) => Math.max(1, p - 1))
                        }
                        disabled={solutionsPage === 1}
                      >
                        {t('previous')}
                      </Button>
                      <span className="flex items-center px-4 text-sm">
                        {t('page')} {solutionsPage} {t('of')}{' '}
                        {totalSolutionsPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSolutionsPage((p) =>
                            Math.min(totalSolutionsPages, p + 1)
                          )
                        }
                        disabled={solutionsPage === totalSolutionsPages}
                      >
                        {t('next')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
