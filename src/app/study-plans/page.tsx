"use client";

import StudyPlanCard from "@/components/study-plans/study-plan-card";
import StudyPlanList from "@/components/study-plans/study-plan-list";
import StudyPlansFilter from "@/components/study-plans/study-plans-filter";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useApp } from "@/contexts/app-context";
import useStudyPlans from "@/hooks/use-study-plans";
import { StudyPlanSortBy } from "@/types/study-plans";
import { Bookmark, Compass, Filter } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function StudyPlansPage() {
  const { t } = useTranslation("study-plans");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const { user } = useApp();

  const {
    studyPlans,
    enrolledPlans,
    meta,
    isLoading,
    isEnrolledLoading,
    error,
    filters,
    keyword,
    handleKeywordChange,
    updateFilters,
    handleLoadMore,
    handleSortByChange,
  } = useStudyPlans();

  const handleReset = () => {
    updateFilters({
      difficulty: undefined,
      isPremium: undefined,
      search: undefined,
      page: 1,
    });
    handleKeywordChange("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary">
      <div className="flex min-h-screen">
        {/* Left Sidebar - Fixed Desktop */}
        <aside className="hidden lg:block w-[320px] shrink-0 border-r border-border bg-background sticky left-0 top-16 h-[calc(100vh-4rem)] z-30 pt-6">
          <div className="h-full overflow-y-auto px-6 pb-6">
            <StudyPlansFilter
              filters={filters}
              keyword={keyword}
              onKeywordChange={handleKeywordChange}
              onFiltersChange={updateFilters}
              onReset={handleReset}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="container mx-auto px-4 lg:px-10 py-10 max-w-[1400px]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3">
                  {t("page_title", "Study Pathways")}
                </h1>
                <p className="text-muted-foreground max-w-2xl text-lg opacity-80">
                  {t(
                    "page_subtitle",
                    "Structured learning journeys designed to elevate your programming mastery. Minimal friction, maximum focus.",
                  )}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <Select
                  value={filters.sortBy || StudyPlanSortBy.ENROLLMENT_COUNT}
                  onValueChange={(val) =>
                    handleSortByChange(val as StudyPlanSortBy)
                  }
                >
                  <SelectTrigger className="w-[180px] bg-muted border-border text-foreground focus:ring-primary/50">
                    <SelectValue placeholder={t("sort_by", "Sort by...")} />
                  </SelectTrigger>
                  <SelectContent className="bg-muted border-border">
                    <SelectItem value={StudyPlanSortBy.ENROLLMENT_COUNT}>
                      {t("sort.popular", "Most Popular")}
                    </SelectItem>
                    <SelectItem value={StudyPlanSortBy.CREATED_AT}>
                      {t("sort.newest", "Newest")}
                    </SelectItem>
                    <SelectItem value={StudyPlanSortBy.ESTIMATED_DAYS}>
                      {t("sort.duration", "Duration")}
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Mobile Filter Trigger */}
                <Sheet
                  open={isMobileFilterOpen}
                  onOpenChange={setIsMobileFilterOpen}
                >
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className="lg:hidden border-border bg-muted text-foreground"
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      {t("filters", "Filters")}
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-[85vw] sm:w-[400px] p-6 bg-background border-r-border"
                  >
                    <SheetTitle className="sr-only text-foreground">
                      {t("filters", "Filters")}
                    </SheetTitle>
                    <div className="mt-8">
                      <StudyPlansFilter
                        filters={filters}
                        keyword={keyword}
                        onKeywordChange={handleKeywordChange}
                        onFiltersChange={updateFilters}
                        onReset={handleReset}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Error State */}
            {error && !isLoading && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center mb-8">
                <p className="text-destructive mb-4">{error}</p>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="border-destructive/50 text-destructive hover:bg-destructive/20"
                >
                  {t("try_again")}
                </Button>
              </div>
            )}

            {/* My Learning Journey */}
            {user && enrolledPlans.length > 0 && !isEnrolledLoading && (
              <div className="mb-14">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">
                      {t("my_learning_journey")}
                    </h2>
                  </div>
                </div>
                {/* Horizontal scroll on mobile, grid on desktop */}
                <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 snap-x snap-mandatory hide-scrollbar">
                  {enrolledPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="min-w-[280px] sm:min-w-0 snap-start"
                    >
                      <StudyPlanCard plan={plan} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Study Plan List area */}
            <div className="flex items-center gap-2 mb-6 mt-4">
              <Compass className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                {t("explore_plans", "Explore Plans")}
              </h2>
            </div>

            <StudyPlanList
              plans={studyPlans}
              hasMore={meta?.hasNextPage ?? false}
              isLoading={isLoading}
              totalCount={meta?.total ?? 0}
              onLoadMore={handleLoadMore}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
