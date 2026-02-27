"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserService } from "@/services/user-service";
import type { ContestRatingChartData } from "@/types/user";
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

interface UserContestRatingChartProps {
  userId: number;
}

export function UserContestRatingChart({
  userId,
}: UserContestRatingChartProps) {
  const { t } = useTranslation("profile");
  const [data, setData] = useState<ContestRatingChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await UserService.getContestRatingChart(userId);
        setData(response.data.data);
      } catch (error) {
        console.error("Error fetching contest rating chart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <Card className="border border-border bg-card shadow-md">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.history.length === 0) {
    return (
      <Card className="border border-border bg-card shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            {t("contest_rating")}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center text-muted-foreground">
          {t("no_contest_rating_data")}
        </CardContent>
      </Card>
    );
  }

  const chartData = data.history.map((entry) => ({
    name: entry.contestTitle,
    rating: entry.rating,
    rank: entry.contestRank,
    delta: entry.ratingDelta,
    date: new Date(entry.contestEndTime).toLocaleDateString(),
  }));

  return (
    <Card className="border border-border bg-card shadow-md">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            {t("contest_rating", "Contest Rating")}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div className="flex flex-col sm:items-end">
              <span className="text-muted-foreground">
                {t("current_rating", "Current Rating")}
              </span>
              <span className="font-bold text-lg text-emerald-600">
                {data.currentRating}
              </span>
            </div>
            {data.peakRating != null && (
              <div className="flex flex-col sm:items-end">
                <span className="text-muted-foreground">
                  {t("peak_rating", "Peak Rating")}
                </span>
                <span className="font-bold text-lg text-blue-600">
                  {data.peakRating}
                </span>
              </div>
            )}
            {data.globalRank != null && (
              <div className="flex flex-col sm:items-end">
                <span className="text-muted-foreground">
                  {t("global_rank", "Global Rank")}
                </span>
                <span className="font-bold text-lg flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  {data.globalRank}
                </span>
              </div>
            )}
            {data.topPercentage != null && (
              <div className="flex flex-col sm:items-end">
                <span className="text-muted-foreground">
                  {t("top_percentage", "Top")}
                </span>
                <span className="font-bold text-lg text-amber-500">
                  {data.topPercentage}%
                </span>
              </div>
            )}
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
                    const point = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-sm min-w-[200px]">
                        <div className="flex flex-col gap-2">
                          <span className="font-bold text-sm">
                            {point.name}
                          </span>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {t("rating", "Rating")}:
                            </span>
                            <span className="font-bold text-emerald-600">
                              {point.rating}
                              <span
                                className={`text-xs ml-1 ${
                                  point.delta >= 0
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                ({point.delta >= 0 ? "+" : ""}
                                {point.delta})
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {t("rank", "Rank")}:
                            </span>
                            <span className="font-medium text-foreground">
                              #{point.rank}
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
      </CardContent>
    </Card>
  );
}
