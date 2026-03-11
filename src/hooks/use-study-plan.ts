import { StudyPlansService } from "@/services/study-plans-service";
import type {
  StudyPlanCardResponseDto,
  StudyPlanDetailResponseDto,
  StudyPlanProgressResponseDto,
} from "@/types/study-plans";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface UseStudyPlanReturn {
  plan: StudyPlanDetailResponseDto | null;
  progress: StudyPlanProgressResponseDto | null;
  similarPlans: StudyPlanCardResponseDto[];
  isLoading: boolean;
  isSimilarLoading: boolean;
  error: string | null;
  isEnrolling: boolean;
  handleEnroll: () => Promise<void>;
  handleUnenroll: () => Promise<void>;
  refresh: () => void;
}

export default function useStudyPlan(slug: string): UseStudyPlanReturn {
  const { t, i18n } = useTranslation("study-plans");
  const lang = i18n.language;
  const [plan, setPlan] = useState<StudyPlanDetailResponseDto | null>(null);
  const [progress, setProgress] = useState<StudyPlanProgressResponseDto | null>(
    null,
  );
  const [similarPlans, setSimilarPlans] = useState<StudyPlanCardResponseDto[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSimilarLoading, setIsSimilarLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!slug) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await StudyPlansService.getStudyPlanDetail(slug, lang);
      setPlan(res.data?.data || null);

      // If enrolled, additionally fetch detailed progress (which may contain extra data)
      if (res.data?.data?.isEnrolled) {
        const progRes = await StudyPlansService.getStudyPlanProgress(
          res.data.data.id,
          lang,
        );
        setProgress(progRes.data?.data || null);
      } else {
        setProgress(null);
      }

      // Fetch similar plans
      if (res.data?.data?.id) {
        try {
          setIsSimilarLoading(true);
          const similarRes = await StudyPlansService.getSimilarPlans(
            res.data.data.id,
            lang,
          );
          setSimilarPlans(similarRes.data?.data || []);
        } catch (simErr) {
          console.error("Error fetching similar plans:", simErr);
        } finally {
          setIsSimilarLoading(false);
        }
      }
    } catch (err: any) {
      console.error("Error fetching study plan details:", err);
      // Determine if it was a 403 Premium error, etc.
      if (err.response?.status === 403) {
        setError("premium_required");
      } else {
        setError(t("error_load_details", "Can't load the study plan details."));
      }
    } finally {
      setIsLoading(false);
    }
  }, [slug, lang, t]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleEnroll = async () => {
    if (!plan) return;
    try {
      setIsEnrolling(true);
      await StudyPlansService.enrollStudyPlan(plan.id, lang);
      await fetchDetail(); // Refresh Data
    } catch (err) {
      console.error("Error enrolling:", err);
      // optionally trigger a toast
      throw err;
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    if (!plan) return;
    try {
      setIsEnrolling(true);
      await StudyPlansService.unenrollStudyPlan(plan.id, lang);
      await fetchDetail(); // Refresh Data
    } catch (err) {
      console.error("Error unenrolling:", err);
      throw err;
    } finally {
      setIsEnrolling(false);
    }
  };

  return {
    plan,
    progress,
    similarPlans,
    isLoading,
    isSimilarLoading,
    error,
    isEnrolling,
    handleEnroll,
    handleUnenroll,
    refresh: fetchDetail,
  };
}
