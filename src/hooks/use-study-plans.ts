import { StudyPlansService } from '@/services/study-plans-service';
import type { FilterStudyPlanDto, StudyPlanListItemResponseDto, StudyPlanSortBy, EnrolledPlanResponseDto } from '@/types/study-plans';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/app-context';

const ITEMS_PER_PAGE = 20;

interface UseStudyPlansState {
  studyPlans: StudyPlanListItemResponseDto[];
  enrolledPlans: EnrolledPlanResponseDto[];
  meta: any;
  isLoading: boolean;
  isEnrolledLoading: boolean;
  error: string | null;
}

export default function useStudyPlans() {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const { user } = useApp();

  const [state, setState] = useState<UseStudyPlansState>({
    studyPlans: [],
    enrolledPlans: [],
    meta: null,
    isLoading: false,
    isEnrolledLoading: false,
    error: null,
  });

  const [filters, setFilters] = useState<FilterStudyPlanDto>({ page: 1, limit: ITEMS_PER_PAGE });
  const [keyword, setKeyword] = useState<string>('');

  const fetchStudyPlans = useCallback(async (currentFilters: FilterStudyPlanDto, currentLang: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await StudyPlansService.getStudyPlans(currentFilters, currentLang);
      
      const data = response.data?.data?.data || [];
      const meta = response.data?.data?.meta || null;

      setState((prev) => ({
        ...prev,
        studyPlans: currentFilters.page === 1 ? data : [...prev.studyPlans, ...data],
        meta: meta,
        isLoading: false,
      }));
    } catch (err) {
      console.error('Error fetching study plans:', err);
      setState((prev) => ({
        ...prev,
        error: "Can't load the study plans.",
        isLoading: false,
      }));
    }
  }, []);

  const fetchEnrolledPlans = useCallback(async (currentLang: string) => {
    if (!user) return;
    try {
      setState((prev) => ({ ...prev, isEnrolledLoading: true }));
      const response = await StudyPlansService.getEnrolledPlans(currentLang);
      const data = response.data?.data || [];
      setState((prev) => ({
        ...prev,
        enrolledPlans: data,
        isEnrolledLoading: false,
      }));
    } catch (err) {
      console.error('Error fetching enrolled plans:', err);
      setState((prev) => ({
        ...prev,
        isEnrolledLoading: false,
      }));
    }
  }, [user]);

  useEffect(() => {
    fetchStudyPlans(filters, lang);
  }, [filters, lang, fetchStudyPlans]);

  useEffect(() => {
    if (user) {
      fetchEnrolledPlans(lang);
    } else {
      setState((prev) => ({ ...prev, enrolledPlans: [] }));
    }
  }, [user, lang, fetchEnrolledPlans]);

  const updateFilters = useCallback((updates: Partial<FilterStudyPlanDto>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleKeywordChange = useCallback((newKeyword: string) => {
    setKeyword(newKeyword);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({
        search: keyword.trim() || undefined,
        page: 1,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword, updateFilters]);

  const handleLoadMore = useCallback(() => {
    if (state.meta?.hasNextPage) {
      updateFilters({ page: (state.meta.page || 0) + 1 });
    }
  }, [state.meta, updateFilters]);

  const handlePageChange = useCallback((page: number) => {
    updateFilters({ page });
  }, [updateFilters]);
  
  const handleSortByChange = useCallback((sortBy: StudyPlanSortBy) => {
    updateFilters({ sortBy, page: 1 });
  }, [updateFilters]);

  return {
    studyPlans: state.studyPlans,
    enrolledPlans: state.enrolledPlans,
    meta: state.meta,
    isLoading: state.isLoading,
    isEnrolledLoading: state.isEnrolledLoading,
    error: state.error,
    filters,
    keyword,
    handleKeywordChange,
    updateFilters,
    handleLoadMore,
    handlePageChange,
    handleSortByChange,
  };
}
