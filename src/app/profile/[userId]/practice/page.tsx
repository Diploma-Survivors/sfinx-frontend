"use client";

import { PracticeFilters } from "@/components/profile/practice/practice-filters";
import { PracticeHistoryTable } from "@/components/profile/practice/practice-history-table";
import { PracticeStatsCard } from "@/components/profile/practice/practice-stats-card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserService } from "@/services/user-service";
import type { ProblemDifficulty, ProblemStatus } from "@/types/problems";
import {
  PracticeHistorySortBy,
  PracticeHistorySortOrder,
  type UserPracticeHistoryItem,
  type UserProblemStats,
} from "@/types/user";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function PracticeHistoryPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId: userIdString } = use(params);
  const userId = Number(userIdString);
  const { t } = useTranslation("profile");

  const [loading, setLoading] = useState(true);
  const [historyItems, setHistoryItems] = useState<UserPracticeHistoryItem[]>(
    [],
  );
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [problemStats, setProblemStats] = useState<UserProblemStats | null>(
    null,
  );

  const [statusFilter, setStatusFilter] = useState<ProblemStatus | "ALL">(
    "ALL",
  );
  const [difficultyFilter, setDifficultyFilter] = useState<
    ProblemDifficulty | "ALL"
  >("ALL");

  const [sortBy, setSortBy] = useState<PracticeHistorySortBy>(
    PracticeHistorySortBy.LAST_SUBMITTED_AT,
  );
  const [sortOrder, setSortOrder] = useState<PracticeHistorySortOrder>(
    PracticeHistorySortOrder.DESC,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [historyResponse, statsResponse] = await Promise.all([
          UserService.getUserPracticeHistory(userId, {
            page: currentPage,
            limit: itemsPerPage,
            status: statusFilter === "ALL" ? undefined : statusFilter,
            difficulty:
              difficultyFilter === "ALL" ? undefined : difficultyFilter,
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
        console.error("Error fetching practice history:", error);
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

  const handleProblemClick = (problemId: number) => {
    router.push(`/problems/${problemId}/submissions`);
  };

  const handleResetFilters = () => {
    setStatusFilter("ALL");
    setDifficultyFilter("ALL");
  };

  if (loading && historyItems.length === 0) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-12">
          <div className="col-span-1 space-y-4 lg:col-span-8">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-[400px] w-full" />
          </div>

          <div className="col-span-1 space-y-6 pt-[52px] lg:col-span-4">
            <Skeleton className="h-[200px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="col-span-1 space-y-4 lg:col-span-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {t("practice_history")}
            </h1>
            <PracticeFilters
              statusFilter={statusFilter}
              difficultyFilter={difficultyFilter}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onStatusChange={setStatusFilter}
              onDifficultyChange={setDifficultyFilter}
              onSortByChange={setSortBy}
              onSortOrderChange={setSortOrder}
              onResetFilters={handleResetFilters}
            />
          </div>

          <PracticeHistoryTable
            historyItems={historyItems}
            expandedRows={expandedRows}
            currentPage={currentPage}
            totalPages={totalPages}
            onToggleRow={toggleRow}
            onProblemClick={handleProblemClick}
            onPageChange={setCurrentPage}
          />
        </div>

        <div className="col-span-1 space-y-6 pt-[52px] lg:col-span-4">
          <PracticeStatsCard problemStats={problemStats} />
        </div>
      </div>
    </div>
  );
}
