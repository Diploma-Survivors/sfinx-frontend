"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserService } from "@/services/user-service";
import type { ContestRatingLeaderboardEntry } from "@/types/user";
import { Crown, Medal, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export function GlobalTopSolvers() {
  const { t } = useTranslation("ranking");
  const [topSolvers, setTopSolvers] = useState<ContestRatingLeaderboardEntry[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  const fetchTopSolvers = async () => {
    try {
      setLoading(true);
      const response = await UserService.getContestRatingLeaderboard(1, 3);
      setTopSolvers(response.data.data.data);
    } catch (error) {
      console.error("Error fetching global top solvers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopSolvers();
  }, []);

  if (loading) {
    return (
      <Card className="border-none shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-8 w-48 mx-auto" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-end gap-4 h-64 pb-4">
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="w-16 h-16 rounded-full" />
              <Skeleton className="w-20 h-4" />
              <Skeleton className="w-24 h-32 rounded-t-lg" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="w-20 h-20 rounded-full" />
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-28 h-40 rounded-t-lg" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="w-16 h-16 rounded-full" />
              <Skeleton className="w-20 h-4" />
              <Skeleton className="w-24 h-24 rounded-t-lg" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const topThree = topSolvers.slice(0, 3);

  return (
    <Card className="border-none shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="text-center pb-2">
        <CardTitle className="flex items-center justify-center gap-2 text-xl">
          <Trophy className="w-5 h-5 text-yellow-500" />
          {t("top_solvers")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {topThree.length >= 3 ? (
          <div className="flex justify-center items-end gap-2 sm:gap-4">
            {/* 2nd Place */}
            <div className="flex flex-col items-center gap-2 order-1">
              <div className="relative">
                <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-gray-300 shadow-lg">
                  <AvatarImage
                    src={
                      topThree[1].user.avatarUrl || "/avatars/placeholder.png"
                    }
                  />
                  <AvatarFallback>
                    <img
                      src="/avatars/placeholder.png"
                      alt={topThree[1].user.username}
                      className="w-full h-full object-cover"
                    />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-300 text-gray-800 px-1.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-0.5">
                  <Medal className="w-2.5 h-2.5" /> 2
                </div>
              </div>
              <div className="text-center">
                <div className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate max-w-[80px]">
                  {topThree[1].user.username}
                </div>
                <div className="text-xs text-emerald-600 font-semibold">
                  {topThree[1].contestRating} {t("rating")}
                </div>
              </div>
              <div className="w-20 sm:w-24 h-24 sm:h-32 bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-t-lg shadow-inner flex items-end justify-center pb-2">
                <span className="text-3xl font-bold text-gray-400/50">2</span>
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center gap-2 order-2 -mt-4">
              <div className="relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-500 animate-bounce">
                  <Crown className="w-6 h-6 fill-current" />
                </div>
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-yellow-400 shadow-xl ring-4 ring-yellow-400/20">
                  <AvatarImage
                    src={
                      topThree[0].user.avatarUrl || "/avatars/placeholder.png"
                    }
                  />
                  <AvatarFallback>
                    <img
                      src="/avatars/placeholder.png"
                      alt={topThree[0].user.username}
                      className="w-full h-full object-cover"
                    />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-0.5">
                  <Trophy className="w-3 h-3" /> 1
                </div>
              </div>
              <div className="text-center">
                <div className="font-bold text-base text-gray-900 dark:text-gray-100 truncate max-w-[100px]">
                  {topThree[0].user.username}
                </div>
                <div className="text-emerald-600 font-bold text-sm">
                  {topThree[0].contestRating} {t("rating")}
                </div>
              </div>
              <div className="w-24 sm:w-28 h-32 sm:h-40 bg-gradient-to-b from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-900/20 rounded-t-lg shadow-inner flex items-end justify-center pb-2 border-t border-yellow-200 dark:border-yellow-800">
                <span className="text-4xl font-bold text-yellow-500/50">1</span>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center gap-2 order-3">
              <div className="relative">
                <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-orange-300 shadow-lg">
                  <AvatarImage
                    src={
                      topThree[2].user.avatarUrl || "/avatars/placeholder.png"
                    }
                  />
                  <AvatarFallback>
                    <img
                      src="/avatars/placeholder.png"
                      alt={topThree[2].user.username}
                      className="w-full h-full object-cover"
                    />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-300 text-orange-900 px-1.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-0.5">
                  <Medal className="w-2.5 h-2.5" /> 3
                </div>
              </div>
              <div className="text-center">
                <div className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate max-w-[80px]">
                  {topThree[2].user.username}
                </div>
                <div className="text-xs text-emerald-600 font-semibold">
                  {topThree[2].contestRating} {t("rating")}
                </div>
              </div>
              <div className="w-20 sm:w-24 h-16 sm:h-24 bg-gradient-to-b from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-900/20 rounded-t-lg shadow-inner flex items-end justify-center pb-2 border-t border-orange-200 dark:border-orange-800">
                <span className="text-3xl font-bold text-orange-500/50">3</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {t("not_enough_data")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
