import { Badge } from "@/components/ui/badge";
import {
  StudyPlanDifficulty,
  type StudyPlanDayResponseDto,
} from "@/types/study-plans";
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  Lock,
  PlayCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getDifficultyColor } from "@/types/problems";
import { useApp } from "@/contexts/app-context";
import { PremiumModal } from "@/components/problems/premium-modal";
import { useState } from "react";

interface StudyPlanCurriculumProps {
  days: StudyPlanDayResponseDto[];
  isEnrolled: boolean;
  isPremiumRequired: boolean;
}

export default function StudyPlanCurriculum({
  days,
  isEnrolled,
  isPremiumRequired,
}: StudyPlanCurriculumProps) {
  const { t } = useTranslation("study-plans");
  const { user } = useApp();
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  if (days.length === 0) {
    return (
      <div className="text-center py-12 border border-border rounded-xl bg-muted/20">
        <p className="text-muted-foreground">{t("no_curriculum")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {days.map((day, index) => {
        const isLastDay = index === days.length - 1;

        return (
          <div key={`day-${day.dayNumber}`} className="relative pl-6 md:pl-10">
            {/* Timeline vertical line */}
            {!isLastDay && (
              <div className="absolute left-[11px] md:left-[27px] top-8 bottom-[-32px] w-px bg-border" />
            )}

            {/* Timeline dot */}
            <div className="absolute left-0 md:left-4 top-1.5 w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
            </div>

            <div className="mb-4">
              <h3 className="text-xl font-bold text-foreground">
                {t("day", "Day")} {day.dayNumber}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {day.items.length} {t("problems", "problems")}
              </p>
            </div>

            <div className="grid gap-3">
              {day.items.map((item) => {
                const problem = item.problem;
                const isSolved = item.progressStatus === "solved"; // Depends on exact string from backend
                const isAttempted = item.progressStatus === "attempted";

                return (
                  <div
                    key={`item-${item.id}`}
                    className={cn(
                      "group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-300",
                      isSolved
                        ? "bg-primary/5 border-primary/20"
                        : "bg-muted/40 border-border hover:border-primary/50 hover:bg-muted/80",
                    )}
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-0.5 shrink-0">
                        {isEnrolled ? (
                          isSolved ? (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          ) : isAttempted ? (
                            <PlayCircle className="w-5 h-5 text-amber-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground" />
                          )
                        ) : (
                          <div className="w-5 h-5 rounded border border-border bg-secondary flex items-center justify-center text-[10px] text-muted-foreground">
                            {item.orderIndex}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 w-full">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "font-bold text-base",
                              isSolved ? "text-primary" : "text-foreground",
                            )}
                          >
                            {problem.title}
                          </span>
                          {problem.isPremium && (
                            <Lock className="w-3.5 h-3.5 text-amber-500" />
                          )}
                        </div>
                        {item.note && (
                          <p className="text-sm text-muted-foreground bg-secondary/30 p-2 rounded mt-2 border border-border">
                            {item.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:w-auto shrink-0 mt-2 sm:mt-0 ml-9 sm:ml-0">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs uppercase",
                          getDifficultyColor(problem.difficulty),
                        )}
                      >
                        {problem.difficulty}
                      </Badge>

                      <Link 
                        href={`/problems/${problem.id}/description`}
                        onClick={(e) => {
                          if (problem.isPremium && (!user || !user.isPremium)) {
                            e.preventDefault();
                            setIsPremiumModalOpen(true);
                          }
                        }}
                      >
                        <span
                          className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors",
                            isEnrolled
                              ? "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                              : "bg-background text-muted-foreground border border-border",
                          )}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      </div>
      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
      />
    </>
  );
}
