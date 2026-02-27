"use client";

import { ActivityCalendar } from "@/components/profile/activity/activity-calendar";
import { RecentActivityList } from "@/components/profile/activity/recent-activity-list";
import { UserDiscussList } from "@/components/profile/discuss/user-discuss-list";
import { ProfileSidebar } from "@/components/profile/profile-sidebar";
import { SolutionsList } from "@/components/profile/solutions/solutions-list";
import { ProblemStatsCard } from "@/components/profile/stats/problem-stats-card";
import { SubmissionStatsCard } from "@/components/profile/stats/submission-stats-card";
import { UserContestHistoryTab } from "@/components/profile/contest-history/user-contest-history-tab";
import { UserContestRatingChart } from "@/components/profile/stats/user-contest-rating-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/contexts/app-context";
import { DiscussService, type Post } from "@/services/discuss-service";
import { UserService } from "@/services/user-service";
import { type Solution, SolutionSortBy } from "@/types/solutions";
import type {
  UserActivityCalendar,
  UserProblemStats,
  UserProfile,
  UserRecentACProblem,
  UserSubmissionStats,
} from "@/types/user";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
export default function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { t } = useTranslation("profile");
  const { userId: userIdString } = use(params);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [problemStats, setProblemStats] = useState<UserProblemStats | null>(
    null,
  );
  const [submissionStats, setSubmissionStats] =
    useState<UserSubmissionStats | null>(null);
  const [activityCalendar, setActivityCalendar] =
    useState<UserActivityCalendar | null>(null);
  const [recentActivity, setRecentActivity] = useState<UserRecentACProblem[]>(
    [],
  );
  const [activityYears, setActivityYears] = useState<number[]>([]);

  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString(),
  );

  const [userSolutions, setUserSolutions] = useState<Solution[]>([]);
  const [solutionsLoading, setSolutionsLoading] = useState(false);
  const [solutionsPage, setSolutionsPage] = useState(1);
  const [totalSolutions, setTotalSolutions] = useState(0);
  const [totalSolutionsPages, setTotalSolutionsPages] = useState(0);
  const solutionsPerPage = 10;
  const [solutionsSortBy, setSolutionsSortBy] = useState<SolutionSortBy>(
    SolutionSortBy.RECENT,
  );

  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsPage, setPostsPage] = useState(1);
  const [totalPostsPages, setTotalPostsPages] = useState(0);
  const postsPerPage = 10;

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
        console.error("Error fetching user solutions:", error);
      } finally {
        setSolutionsLoading(false);
      }
    },
    [],
  );

  const fetchUserPosts = useCallback(async (userId: number, page: number) => {
    setPostsLoading(true);
    try {
      const response = await DiscussService.getUserPosts(userId, {
        page,
        limit: postsPerPage,
        sortBy: "newest",
      });
      setUserPosts(response.data);
      setTotalPostsPages(response.meta.totalPages);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = Number(userIdString);

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

        fetchUserSolutions(userId, solutionsPage, solutionsSortBy);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userIdString, fetchUserSolutions, solutionsPage, solutionsSortBy]);

  useEffect(() => {
    const fetchCalendar = async () => {
      if (!userIdString) return;
      try {
        const userId = Number(userIdString);
        const year = Number(selectedYear);
        const response = await UserService.getUserActivityCalendar(
          userId,
          year,
        );
        setActivityCalendar(response.data.data);
      } catch (error) {
        console.error("Error fetching activity calendar:", error);
      }
    };

    fetchCalendar();
  }, [userIdString, selectedYear]);

  useEffect(() => {
    if (!userIdString) return;
    fetchUserSolutions(Number(userIdString), solutionsPage, solutionsSortBy);
  }, [userIdString, solutionsPage, solutionsSortBy, fetchUserSolutions]);

  useEffect(() => {
    if (!userIdString) return;
    fetchUserPosts(Number(userIdString), postsPage);
  }, [userIdString, postsPage, fetchUserPosts]);

  const handleProblemClick = (problemId: number) => {
    router.push(`/problems/${problemId}/description`);
  };

  const handleSolutionClick = (solutionId: string) => {
    const solution = userSolutions.find((s) => s.id === solutionId);
    if (solution) {
      router.push(`/problems/${solution.problemId}/solutions/${solutionId}`);
    }
  };

  const handleEditProfile = () => {
    router.push("/settings");
  };

  if (loading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 space-y-6 lg:col-span-3">
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
          <div className="col-span-12 space-y-6 lg:col-span-9">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Skeleton className="h-[300px] w-full rounded-xl" />
              <Skeleton className="h-[300px] w-full rounded-xl" />
            </div>
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <div>{t("user_not_found")}</div>;

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 space-y-6 lg:col-span-3">
          <ProfileSidebar
            user={user}
            isCurrentUser={isCurrentUser}
            onEditClick={handleEditProfile}
          />
        </div>

        <div className="col-span-12 space-y-6 lg:col-span-9">
          <UserContestRatingChart userId={Number(userIdString)} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ProblemStatsCard problemStats={problemStats} />
            <SubmissionStatsCard submissionStats={submissionStats} />
          </div>

          <Card className="border border-border bg-card shadow-md">
            <CardContent className="pt-6">
              <ActivityCalendar
                activityCalendar={activityCalendar}
                activityYears={activityYears}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
              />
            </CardContent>
          </Card>

          <Tabs defaultValue="recent-ac" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-[800px]">
              <TabsTrigger value="recent-ac">
                {t("recent_ac_problems")}
              </TabsTrigger>
              <TabsTrigger value="solutions">{t("solutions")}</TabsTrigger>
              <TabsTrigger value="contest-history">
                {t("contest_history", "Contest History")}
              </TabsTrigger>
              <TabsTrigger value="discuss">{t("discuss")}</TabsTrigger>
            </TabsList>

            <TabsContent value="recent-ac" className="mt-6">
              <Card className="border border-border bg-card shadow-md">
                <CardHeader>
                  <CardTitle>{t("recent_ac_problems")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentActivity.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      {t("no_recent_activity")}
                    </div>
                  ) : (
                    <RecentActivityList
                      recentActivity={recentActivity}
                      onProblemClick={handleProblemClick}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="solutions" className="mt-6">
              <Card className="border border-border bg-card shadow-md">
                <CardHeader>
                  <CardTitle>{t("solutions")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <SolutionsList
                    solutions={userSolutions}
                    loading={solutionsLoading}
                    currentPage={solutionsPage}
                    totalPages={totalSolutionsPages}
                    sortBy={solutionsSortBy}
                    onPageChange={setSolutionsPage}
                    onSortChange={setSolutionsSortBy}
                    onSolutionClick={handleSolutionClick}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contest-history" className="mt-6">
              <Card className="border border-border bg-card shadow-md">
                <CardHeader>
                  <CardTitle>
                    {t("contest_history", "Contest History")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UserContestHistoryTab userId={Number(userIdString)} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discuss" className="mt-6">
              <Card className="border border-border bg-card shadow-md">
                <CardHeader>
                  <CardTitle>{t("discuss")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <UserDiscussList
                    posts={userPosts}
                    loading={postsLoading}
                    currentPage={postsPage}
                    totalPages={totalPostsPages}
                    onPageChange={setPostsPage}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
