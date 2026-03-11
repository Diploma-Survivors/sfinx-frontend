import StudyPlanCard from "./study-plan-card";
import type { StudyPlanListItemResponseDto } from "@/types/study-plans";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

interface StudyPlanListProps {
  plans: StudyPlanListItemResponseDto[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  totalCount: number;
}

export default function StudyPlanList({
  plans,
  isLoading,
  hasMore,
  onLoadMore,
  totalCount,
}: StudyPlanListProps) {
  const { t } = useTranslation("study-plans");

  if (isLoading && plans.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 rounded-xl border border-border bg-card">
            <Skeleton className="h-full w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border border-border rounded-xl bg-card">
        <p className="text-muted-foreground font-mono">
          {t("no_study_plans_found")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <StudyPlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-6 py-2.5 text-sm font-medium rounded-lg border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t("loading") : t("load_more")}
          </button>
        </div>
      )}
    </div>
  );
}
