import { SolutionsService } from '@/services/solutions-service';
import {
  type PageInfo,
  type Solution,
  type SolutionFilters,
  type SolutionListRequest,
  type SolutionMeta,
  SolutionSortBy,
} from '@/types/solutions';
import { useCallback, useEffect, useState } from 'react';

const ITEMS_PER_PAGE = 10;

interface UseSolutionsState {
  solutions: Solution[];
  meta: SolutionMeta | null;
  isLoading: boolean;
  error: string | null;
}

interface UseSolutionsActions {
  handleFiltersChange: (newFilters: SolutionFilters) => void;
  handleKeywordChange: (newKeyword: string) => void;
  handleSortByChange: (newSortBy: SolutionSortBy) => void;
  handleSearch: () => void;
  handleReset: () => void;
  handleLoadMore: () => void;
  refresh: () => void;
}

interface UseSolutionsReturn extends UseSolutionsState, UseSolutionsActions {
  filters: SolutionFilters;
  keyword: string;
  sortBy: SolutionSortBy;
}

export default function useSolutions(problemId: string): UseSolutionsReturn {
  const [state, setState] = useState<UseSolutionsState>({
    solutions: [],
    meta: null,
    isLoading: false,
    error: null,
  });

  const [filters, setFilters] = useState<SolutionFilters>({});
  const [keyword, setKeyword] = useState<string>('');
  const [sortBy, setSortBy] = useState<SolutionSortBy>(SolutionSortBy.RECENT);

  const [request, setRequest] = useState<SolutionListRequest>({
    problemId,
    limit: ITEMS_PER_PAGE,
    page: 1,
    sortBy: SolutionSortBy.RECENT,
    filters: {},
  });

  const fetchSolutions = useCallback(async (req: SolutionListRequest) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await SolutionsService.getSolutionsList(req);

      const newSolutions = response.data.data.data;

      setState((prev) => ({
        ...prev,
        solutions:
          req.page && req.page > 1
            ? [...prev.solutions, ...newSolutions]
            : newSolutions,
        meta: response.data.data.meta,
        isLoading: false,
      }));
    } catch (err) {
      console.error('Error fetching solutions:', err);
      setState((prev) => ({
        ...prev,
        error: "Can't load solutions.",
        isLoading: false,
      }));
    }
  }, []);

  useEffect(() => {
    fetchSolutions(request);
  }, [request, fetchSolutions]);

  const updateRequest = useCallback(
    (updates: Partial<SolutionListRequest>, clearList = false) => {
      if (clearList) {
        setState((prev) => ({ ...prev, solutions: [] }));
      }
      setRequest((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const handleFiltersChange = useCallback(
    (newFilters: SolutionFilters) => {
      setFilters(newFilters);
      updateRequest({ filters: newFilters, page: 1 }, true);
    },
    [updateRequest]
  );

  const handleKeywordChange = useCallback(
    (newKeyword: string) => {
      setKeyword(newKeyword);
      updateRequest({ keyword: newKeyword.trim() || undefined, page: 1 }, true);
    },
    [updateRequest]
  );

  const handleSortByChange = useCallback(
    (newSortBy: SolutionSortBy) => {
      setSortBy(newSortBy);
      updateRequest({ sortBy: newSortBy, page: 1 }, true);
    },
    [updateRequest]
  );

  const handleSearch = useCallback(() => {
    updateRequest(
      {
        keyword: keyword.trim() || undefined,
        filters: { ...filters },
        page: 1,
      },
      true
    );
  }, [keyword, filters, updateRequest]);

  const handleReset = useCallback(() => {
    setFilters({});
    setKeyword('');
    setSortBy(SolutionSortBy.RECENT);
    updateRequest(
      {
        keyword: undefined,
        filters: {},
        sortBy: SolutionSortBy.RECENT,
        page: 1,
      },
      true
    );
  }, [updateRequest]);

  const handleLoadMore = useCallback(() => {
    if (state.isLoading || !state.meta?.hasNextPage) return;
    updateRequest(
      {
        page: (state.meta.page || 1) + 1,
      },
      false
    );
  }, [state.isLoading, state.meta, updateRequest]);

  const refresh = useCallback(() => {
    fetchSolutions(request);
  }, [fetchSolutions, request]);

  return {
    ...state,
    filters,
    keyword,
    sortBy,
    handleFiltersChange,
    handleKeywordChange,
    handleSortByChange,
    handleSearch,
    handleReset,
    handleLoadMore,
    refresh,
  };
}
