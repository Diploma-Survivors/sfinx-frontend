"use client";

import StudyPlanHeader from "@/components/study-plans/study-plan-header";
import StudyPlanCurriculum from "@/components/study-plans/study-plan-curriculum";
import StudyPlanLeaderboard from "@/components/study-plans/study-plan-leaderboard";
import StudyPlanCard from "@/components/study-plans/study-plan-card";
import useStudyPlan from "@/hooks/use-study-plan";
import { useTranslation } from "react-i18next";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Trophy, Sparkles } from "lucide-react";

export default function StudyPlanDetailPage() {
  const { t } = useTranslation("study-plans");
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const {
    plan,
    progress,
    similarPlans,
    isSimilarLoading,
    isLoading,
    error,
    isEnrolling,
    handleEnroll,
  } = useStudyPlan(slug);

  if (isLoading && !plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          {error === "premium_required"
            ? t("premium_required_title")
            : t("plan_not_found")}
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          {error === "premium_required"
            ? t("premium_required_desc")
            : t("plan_not_found_desc")}
        </p>
        <Button
          onClick={() => router.push("/study-plans")}
          variant="outline"
          className="border-border bg-muted text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("back_to_plans")}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary py-8">
      <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
        <button
          onClick={() => router.push("/study-plans")}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
          {t("back_to_plans", "Back to Plans")}
        </button>

        <StudyPlanHeader
          plan={plan}
          progress={progress}
          onEnroll={handleEnroll}
          isEnrolling={isEnrolling}
        />

        <Tabs defaultValue="curriculum" className="w-full">
          <TabsList className="bg-muted/50 border border-border p-1 mb-8 w-full justify-start h-auto rounded-xl">
            <TabsTrigger
              value="curriculum"
              className="text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xl rounded-lg py-2.5 px-6"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              {t("curriculum", "Curriculum")}
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xl rounded-lg py-2.5 px-6"
            >
              <Trophy className="w-4 h-4 mr-2" />
              {t("leaderboard", "Leaderboard")}
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="curriculum"
            className="focus-visible:outline-none focus-visible:ring-0"
          >
            <StudyPlanCurriculum
              days={plan.days}
              isEnrolled={plan.isEnrolled}
              isPremiumRequired={plan.isPremium}
            />
          </TabsContent>

          <TabsContent
            value="leaderboard"
            className="focus-visible:outline-none focus-visible:ring-0"
          >
            <StudyPlanLeaderboard planId={plan.id} />
          </TabsContent>
        </Tabs>

        {/* Similar Plans Section */}
        {similarPlans.length > 0 && (
          <div className="mt-16 pt-12 border-t border-border">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">
                {t("similar_plans")}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarPlans.map((similar) => (
                <StudyPlanCard key={similar.id} plan={similar} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
