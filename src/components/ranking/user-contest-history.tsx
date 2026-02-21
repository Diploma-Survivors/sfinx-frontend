"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/contexts/app-context";
import { UserService } from "@/services/user-service";
import type { ContestHistoryEntry } from "@/types/user";
import { TrendingUp, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function UserContestHistory() {
  const { t } = useTranslation("ranking");
  const { user } = useApp();
  const [history, setHistory] = useState<ContestHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await UserService.getContestHistory(user.id);
        // Sort by date ascending for chart
        const sorted = response.data.data.sort(
          (a, b) =>
            new Date(a.contestEndTime).getTime() -
            new Date(b.contestEndTime).getTime(),
        );
        setHistory(sorted);
      } catch (error) {
        console.error("Error fetching contest history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (!user) {
    return null; // Don't show if user is not logged in
  }

  if (loading) {
    return (
      <Card className="border-none shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="border-none shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            {t("rating_history")}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-32 flex items-center justify-center text-muted-foreground">
          {t("no_contest_history")}
        </CardContent>
      </Card>
    );
  }

  // Format data for chart
  const chartData = history.map((entry) => ({
    name: entry.contestTitle,
    rating: entry.ratingAfter,
    rank: entry.contestRank,
    delta: entry.ratingDelta,
    date: new Date(entry.contestEndTime).toLocaleDateString(),
  }));

  const currentRating = history[history.length - 1].ratingAfter;
  const maxRating = Math.max(...history.map((h) => h.ratingAfter));

  return (
    <Card className="border-none shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            {t("rating_history")}
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex flex-col items-end">
              <span className="text-muted-foreground">
                {t("current_rating")}
              </span>
              <span className="font-bold text-lg text-emerald-600">
                {currentRating}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-muted-foreground">{t("max_rating")}</span>
              <span className="font-bold text-lg text-blue-600">
                {maxRating}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {t("contest")}
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {data.name}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {t("rating")}
                            </span>
                            <span className="font-bold text-emerald-600">
                              {data.rating}
                              <span
                                className={`text-xs ml-1 ${
                                  data.delta >= 0
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                ({data.delta >= 0 ? "+" : ""}
                                {data.delta})
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 4, fill: "#2563eb" }}
                activeDot={{ r: 6, fill: "#2563eb" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity List */}
        <div className="mt-6 space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground">
            {t("recent_contests")}
          </h4>
          <div className="space-y-2">
            {[...history]
              .reverse()
              .slice(0, 5)
              .map((entry) => (
                <div
                  key={entry.contestId}
                  className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{entry.contestTitle}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.contestEndTime).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Trophy className="w-3 h-3" />#{entry.contestRank}
                    </span>
                    <div className="flex flex-col items-end w-20">
                      <span className="font-medium">{entry.ratingAfter}</span>
                      <span
                        className={`text-xs ${
                          entry.ratingDelta >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {entry.ratingDelta >= 0 ? "+" : ""}
                        {entry.ratingDelta}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
