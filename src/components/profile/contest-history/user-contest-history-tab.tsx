import { useEffect, useState, useCallback } from "react";
import { UserService } from "@/services/user-service";
import type { ContestHistoryEntry } from "@/types/user";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface UserContestHistoryTabProps {
  userId: number;
}

export function UserContestHistoryTab({ userId }: UserContestHistoryTabProps) {
  const { t } = useTranslation("profile");
  const [history, setHistory] = useState<ContestHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchHistory = useCallback(
    async (currentPage: number) => {
      setLoading(true);
      try {
        const response = await UserService.getContestHistory(userId, {
          page: currentPage,
          limit,
        });
        setHistory(response.data.data.data);
        setTotalPages(response.data.data.meta.totalPages);
      } catch (error) {
        console.error("Failed to fetch contest history:", error);
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    fetchHistory(page);
  }, [page, fetchHistory]);

  const getDeltaBadge = (delta: number) => {
    if (delta > 0) {
      return (
        <Badge
          variant="default"
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <TrendingUp className="mr-1 h-3 w-3" />+{delta}
        </Badge>
      );
    }
    if (delta < 0) {
      return (
        <Badge variant="destructive">
          <TrendingDown className="mr-1 h-3 w-3" />
          {delta}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <Minus className="mr-1 h-3 w-3" />0
      </Badge>
    );
  };

  if (loading && history.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {t("no_contest_history")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border text-sm max-w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("contest")}</TableHead>
              <TableHead className="text-right">{t("rank")}</TableHead>
              <TableHead className="text-right">{t("rating_check")}</TableHead>
              <TableHead className="text-right">{t("new_rating")}</TableHead>
              <TableHead className="text-right">{t("date")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((entry) => (
              <TableRow key={entry.contestId}>
                <TableCell className="font-medium whitespace-nowrap">
                  {entry.contestTitle}
                </TableCell>
                <TableCell className="text-right">
                  #{entry.contestRank}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    {getDeltaBadge(entry.ratingDelta)}
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold text-emerald-600">
                  {entry.ratingAfter}
                </TableCell>
                <TableCell className="text-right text-muted-foreground whitespace-nowrap">
                  {format(new Date(entry.contestEndTime), "MMM d, yyyy")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            {t("page_n_of_m", { current: page, total: totalPages })}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              {t("previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              {t("next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
