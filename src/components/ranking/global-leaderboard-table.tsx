"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserService } from "@/services/user-service";
import type { ContestRatingLeaderboardEntry } from "@/types/user";
import { Medal, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export function GlobalLeaderboardTable() {
  const { t } = useTranslation("ranking");
  const [leaderboard, setLeaderboard] = useState<
    ContestRatingLeaderboardEntry[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await UserService.getContestRatingLeaderboard(
        currentPage,
        itemsPerPage,
      );
      setLeaderboard(response.data.data.data);
      setTotalPages(response.data.data.meta.totalPages);
    } catch (error) {
      console.error("Error fetching global leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  if (loading) {
    return (
      <Card className="border border-border shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-64" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <CardTitle>{t("leaderboard")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14 text-center">{t("rank")}</TableHead>
              <TableHead>{t("user")}</TableHead>
              <TableHead className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {t("rating")}
                </div>
              </TableHead>
              <TableHead className="text-right hidden sm:table-cell">
                <div className="flex items-center justify-end gap-1">
                  {t("contests_participated")}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map((entry) => (
              <TableRow
                key={entry.user.id}
                className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <TableCell className="text-center font-medium">
                  {entry.rank <= 3 ? (
                    <div className="flex justify-center">
                      {entry.rank === 1 && (
                        <Trophy className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                      {entry.rank === 2 && (
                        <Medal className="w-4 h-4 text-gray-400 fill-current" />
                      )}
                      {entry.rank === 3 && (
                        <Medal className="w-4 h-4 text-orange-400 fill-current" />
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">#{entry.rank}</span>
                  )}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/profile/${entry.user.id}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <Avatar className="w-8 h-8 border border-gray-200">
                      <AvatarImage
                        src={entry.user.avatarUrl || "/avatars/placeholder.png"}
                      />
                      <AvatarFallback>
                        <img
                          src="/avatars/placeholder.png"
                          alt={entry.user.username}
                          className="w-full h-full object-cover"
                        />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {entry.user.username}
                      </span>
                      <span className="text-[10px] text-gray-500 hidden sm:inline-block">
                        {entry.user.fullName || entry.user.username}
                      </span>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
                  >
                    {entry.contestRating}
                  </Badge>
                </TableCell>
                <TableCell className="text-right hidden sm:table-cell">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    {entry.contestsParticipated}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {leaderboard.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-gray-500"
                >
                  {t("no_users_found")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              {t("previous")}
            </Button>
            <span className="flex items-center px-4 text-sm text-gray-600">
              {t("page_info", {
                current: currentPage,
                total: totalPages,
              })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              {t("next")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
