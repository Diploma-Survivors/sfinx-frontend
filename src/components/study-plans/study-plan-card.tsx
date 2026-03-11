import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  StudyPlanDifficulty,
  type StudyPlanCardResponseDto,
  EnrollmentStatus,
} from "@/types/study-plans";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Lock,
  Target,
  Trophy,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/app-context";
import { PremiumModal } from "@/components/problems/premium-modal";
import { useState } from "react";

interface StudyPlanCardProps {
  plan: StudyPlanCardResponseDto & {
    totalProblems?: number;
    isEnrolled?: boolean;
    solvedCount?: number;
    lastActivityAt?: Date | null;
    enrollmentStatus?: EnrollmentStatus | null;
    currentDay?: number;
    completedAt?: Date | null;
    enrolledAt?: Date;
  };
}

export default function StudyPlanCard({ plan }: StudyPlanCardProps) {
  const { t, i18n } = useTranslation("study-plans");
  const { user } = useApp();
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  const progressPercentage =
    plan.totalProblems &&
    plan.totalProblems > 0 &&
    plan.solvedCount !== undefined
      ? Math.round((plan.solvedCount / plan.totalProblems) * 100)
      : 0;

  const isCompleted = plan.enrollmentStatus === EnrollmentStatus.COMPLETED;
  const isEnrolled =
    plan.isEnrolled !== undefined ? plan.isEnrolled : !!plan.enrollmentStatus;

  const formatDate = (date?: Date | string | null) => {
    if (!date) return "";
    return new Intl.DateTimeFormat(i18n.language, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const getDifficultyColor = (difficulty: StudyPlanDifficulty) => {
    switch (difficulty) {
      case StudyPlanDifficulty.BEGINNER:
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case StudyPlanDifficulty.INTERMEDIATE:
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case StudyPlanDifficulty.ADVANCED:
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (plan.isPremium && (!user || !user.isPremium)) {
      e.preventDefault();
      setIsPremiumModalOpen(true);
    }
  };

  return (
    <>
      <Link
        href={`/study-plans/${plan.slug}`}
        className="block group h-full"
        onClick={handleCardClick}
      >
        <Card
          className={cn(
            "h-full flex flex-col relative overflow-hidden transition-all duration-300",
            "bg-card backdrop-blur-sm border-border",
            "hover:border-primary/50 hover:shadow-[0_0_30px_-10px_rgba(var(--primary),0.15)] hover:-translate-y-1",
          )}
        >
          {plan.coverImageUrl && (
            <div className="relative h-32 w-full overflow-hidden shrink-0">
              <img
                src={plan.coverImageUrl}
                alt={plan.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
            </div>
          )}

          {/* Glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <CardHeader
            className={cn(
              "p-5 pb-4 relative z-10",
              plan.coverImageUrl ? "pt-2" : "",
            )}
          >
            <div className="flex justify-between items-start gap-3 mb-3">
              <h3 className="text-lg font-bold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                {plan.name}
              </h3>
              {plan.isPremium && (
                <Badge
                  variant="secondary"
                  className="shrink-0 bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] uppercase"
                >
                  <Lock className="w-3 h-3 mr-1" /> Premium
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-xs capitalize",
                  getDifficultyColor(plan.difficulty),
                )}
              >
                {t(`difficulty.${plan.difficulty}`)}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs bg-muted text-muted-foreground border-border"
              >
                {plan.estimatedDays} {t("days")}
              </Badge>
              {isEnrolled && plan.currentDay !== undefined && (
                <Badge
                  variant="outline"
                  className="text-xs bg-primary/10 text-primary border-primary/20"
                >
                  {t("day_of", {
                    current: plan.currentDay,
                    total: plan.estimatedDays,
                  })}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-0 flex-grow flex flex-col justify-end">
            <div className="grid grid-cols-1 gap-2 mb-6 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{t("problems")}</span>
                </div>
                <span className="font-medium text-foreground">
                  {plan.totalProblems ?? 0}
                </span>
              </div>

              {isEnrolled && plan.solvedCount !== undefined && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary/70" />
                    <span>{t("solved")}</span>
                  </div>
                  <span className="font-medium text-primary">
                    {plan.solvedCount}
                  </span>
                </div>
              )}

              {isEnrolled && plan.enrolledAt && !isCompleted && (
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    <span className="text-xs">{t("started_on")}</span>
                  </div>
                  <span className="text-xs font-medium">
                    {formatDate(plan.enrolledAt)}
                  </span>
                </div>
              )}

              {isCompleted && plan.completedAt && (
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="text-xs">{t("completed_on")}</span>
                  </div>
                  <span className="text-xs font-medium text-primary">
                    {formatDate(plan.completedAt)}
                  </span>
                </div>
              )}

              {isEnrolled && plan.lastActivityAt && (
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    <span className="text-xs">{t("last_activity")}</span>
                  </div>
                  <span className="text-xs font-medium">
                    {formatDate(plan.lastActivityAt)}
                  </span>
                </div>
              )}
            </div>

            {isEnrolled && plan.totalProblems !== undefined ? (
              <div className="space-y-2 mt-auto">
                <div className="flex justify-between items-center text-xs">
                  <span
                    className={
                      isCompleted ? "text-primary" : "text-muted-foreground"
                    }
                  >
                    {isCompleted ? t("completed") : t("progress")}
                  </span>
                  <span className="text-primary font-medium">
                    {progressPercentage}%
                  </span>
                </div>
                <Progress
                  value={progressPercentage}
                  className="h-1.5 bg-secondary"
                  indicatorClassName={cn(
                    "transition-all duration-500 ease-out bg-primary",
                  )}
                />
              </div>
            ) : (
              <div className="mt-auto px-4 py-2 rounded border border-border bg-secondary text-center text-sm text-muted-foreground group-hover:bg-secondary/80 group-hover:text-foreground transition-colors">
                {t("view_plan")}
              </div>
            )}
          </CardContent>

          {isCompleted && (
            <div className="absolute top-0 right-0 p-1 bg-primary text-primary-foreground rounded-bl-lg shadow-lg">
              <Trophy className="w-4 h-4" />
            </div>
          )}
        </Card>
      </Link>

      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
      />
    </>
  );
}
