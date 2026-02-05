import { SubmissionsService } from '@/services/submissions-service';
import type {
  GetSubmissionListRequest,
  Submission,
  SubmissionFilters,
  SubmissionListResponse,
} from '@/types/submissions';
import { useCallback, useEffect, useState } from 'react';

const ITEMS_PER_PAGE = 10;

interface UseSubmissionsState {
  submissions: Submission[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

interface UseSubmissionsActions {
  handleFiltersChange: (newFilters: SubmissionFilters) => void;
  handleLoadMore: () => void;
}

interface UseSubmissionsReturn
  extends UseSubmissionsState,
    UseSubmissionsActions {
  // Request params (exposed for UI)
  filters: SubmissionFilters;
  problemId: number;
  hasMore: boolean;
}

export default function useSubmissions(
  problemId: number,
  contestId?: number
): UseSubmissionsReturn {
  // Main state to manage submissions and loading/error states
  const [state, setState] = useState<UseSubmissionsState>({
    submissions: [],
    totalCount: 0,
    currentPage: 1,
    totalPages: 0,
    isLoading: false,
    error: null,
  });

  // Request state to manage API request parameters
  const [request, setRequest] = useState<GetSubmissionListRequest>({
    page: 1,
    limit: ITEMS_PER_PAGE,
  });

  // Filters state to manage filters
  const [filters, setFilters] = useState<SubmissionFilters>({});

  // Fetch submissions function
  const fetchSubmissions = useCallback(
    async (requestParams: GetSubmissionListRequest, isLoadMore = false) => {
      if (!problemId) return;

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const axiosResponse = await SubmissionsService.getSubmissionList(
          requestParams,
          problemId,
          contestId
        );
        if (!axiosResponse?.data?.data) {
          throw new Error('Failed to fetch submissions');
        }
        const response: SubmissionListResponse = axiosResponse.data.data;

        setState((prev) => ({
          ...prev,
          submissions: isLoadMore
            ? [...prev.submissions, ...response.data]
            : response.data,
          totalCount: response.meta.total,
          currentPage: response.meta.page,
          totalPages: response.meta.totalPages,
          isLoading: false,
        }));
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setState((prev) => ({
          ...prev,
          error: "Can't load the submissions.",
          isLoading: false,
        }));
      }
    },
    [problemId, contestId]
  );

  // Effect to fetch submissions when request or problemId changes
  // We only trigger this effect if it's NOT a load more action initiated by handleLoadMore
  // But handleLoadMore updates request, so we need to distinguish.
  // Actually, simpler: useEffect watches request. handleLoadMore updates request.
  useEffect(() => {
    if (problemId) {
      // Check if we are loading more (page > 1) or refreshing (page === 1)
      // But wait, if we change filters, we reset page to 1.
      // If we load more, we increment page.
      const isLoadMore = (request.page || 1) > 1;
      fetchSubmissions(request, isLoadMore);
    }
  }, [request, fetchSubmissions, problemId]);

  // Helper function to update request
  const updateRequest = useCallback(
    (updates: Partial<GetSubmissionListRequest>, clearSubmissions = false) => {
      if (clearSubmissions) {
        setState((prev) => ({ ...prev, submissions: [], currentPage: 1 }));
      }

      setRequest((prev) => ({
        ...prev,
        ...updates,
      }));
    },
    []
  );

  // Handle filter changes
  const handleFiltersChange = useCallback(
    (filters: SubmissionFilters) => {
      // Filter out undefined values
      const cleanFilters = Object.fromEntries(
        Object.entries(filters || {}).filter(
          ([_, value]) => value !== undefined
        )
      );

      setFilters(cleanFilters);
      updateRequest({ filters: cleanFilters, page: 1 }, true);
    },
    [updateRequest]
  );

  // Handle load more for pagination
  const handleLoadMore = useCallback(() => {
    if (state.isLoading || state.currentPage >= state.totalPages) {
      return;
    }
    updateRequest(
      {
        page: state.currentPage + 1,
      },
      false
    );
  }, [state.isLoading, state.currentPage, state.totalPages, updateRequest]);

  return {
    // State
    submissions: state.submissions,
    totalCount: state.totalCount,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    isLoading: state.isLoading,
    error: state.error,
    hasMore: state.currentPage < state.totalPages,

    // Request params (exposed for UI)
    filters,
    problemId,

    // Handlers
    handleFiltersChange,
    handleLoadMore,
  };
}
