import { StudyPlansService } from "@/services/study-plans-service";
import type { LeaderboardEntryResponseDto } from "@/types/study-plans";
import { Trophy, Medal, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface StudyPlanLeaderboardProps {
  planId: number;
}

export default function StudyPlanLeaderboard({
  planId,
}: StudyPlanLeaderboardProps) {
  const { t, i18n } = useTranslation("study-plans");
  const lang = i18n.language;
  const [entries, setEntries] = useState<LeaderboardEntryResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const res = await StudyPlansService.getLeaderboard(planId, 20, lang);
        setEntries(res.data?.data || []);
      } catch (err) {
        console.error("Leaderboard error:", err);
        setError(t("error_load_leaderboard"));
      } finally {
        setIsLoading(false);
      }
    };
    if (planId) {
      fetchLeaderboard();
    }
  }, [planId, lang, t]);

  if (isLoading) {
    return (
      <div className="space-y-4 pt-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/20"
          >
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-2 w-full max-w-xs" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive border border-destructive/20 rounded-xl bg-destructive/5">
        {error}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 border border-border rounded-xl bg-muted/20">
        <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">{t("empty_leaderboard")}</p>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <Crown className="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
        );
      case 2:
        return (
          <Medal className="w-6 h-6 text-slate-300 drop-shadow-[0_0_5px_rgba(203,213,225,0.5)]" />
        );
      case 3:
        return (
          <Medal className="w-6 h-6 text-amber-700 drop-shadow-[0_0_5px_rgba(180,83,9,0.5)]" />
        );
      default:
        return (
          <span className="text-muted-foreground w-6 text-center font-bold">
            #{rank}
          </span>
        );
    }
  };

  return (
    <div className="space-y-3 pt-4">
      {entries.map((entry) => (
        <div
          key={`rank-${entry.userId}`}
          className={cn(
            "flex sm:items-center flex-col sm:flex-row gap-4 p-4 rounded-xl border transition-colors",
            entry.rank <= 3
              ? "bg-secondary/80 border-primary/20"
              : "bg-muted/30 border-border hover:bg-muted/50",
          )}
        >
          <div className="flex items-center gap-4">
            <div className="w-8 flex justify-center shrink-0">
              {getRankIcon(entry.rank)}
            </div>

            <Avatar
              className={cn(
                "h-10 w-10 border-2",
                entry.rank === 1
                  ? "border-amber-400"
                  : entry.rank === 2
                    ? "border-slate-300"
                    : entry.rank === 3
                      ? "border-amber-700"
                      : "border-border",
              )}
            >
              <AvatarImage src={entry.avatarKey || undefined} />
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                {(entry.username || "U").substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="w-32 sm:w-48">
              <p className="font-bold text-foreground text-sm truncate">
                {entry.username || t("anonymous")}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {entry.status === "completed" ? (
                  <span className="text-primary">{t("completed")}</span>
                ) : (
                  t("in_progress")
                )}
              </p>
            </div>
          </div>

          <div className="flex-1 mt-2 sm:mt-0 pl-12 sm:pl-0">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-muted-foreground">
                {entry.solvedCount} / {entry.totalProblems}
              </span>
              <span className="text-primary">
                {entry.progressPercentage}%
              </span>
            </div>
            <Progress
              value={entry.progressPercentage}
              className="h-1.5 bg-secondary"
              indicatorClassName={
                entry.status === "completed" ? "bg-amber-400" : "bg-primary"
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}
