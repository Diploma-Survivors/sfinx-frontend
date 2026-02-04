import { ContestsService } from '@/services/contests-service';
import {
  type Contest,
  type ContestFilters,
  type ContestListRequest,
  type ContestListResponse,
  ContestSortBy,
  ContestStatus,
} from '@/types/contests';
import { SortOrder } from '@/types/problems';
import { useCallback, useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

const ITEMS_PER_PAGE = 20;

interface UseContestsState {
  contests: Contest[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    totalPages: number;
    page: number;
    limit: number;
  };
  totalCount: number;
  isLoading: boolean;
  error: string | null;
}

interface UseContestsActions {
  handleFiltersChange: (newFilters: ContestFilters) => void;
  handleSearchChange: (newSearch: string) => void;
  handleReset: () => void;
  handleLoadMore: () => void;
  handleSortByChange: (newSortBy: ContestSortBy) => void;
  handleSortOrderChange: (newSortOrder: SortOrder) => void;
}

interface UseContestsReturn extends UseContestsState, UseContestsActions {
  // Request params (exposed for UI)
  search: string;
  filters: ContestFilters;
  sortBy: ContestSortBy;
  sortOrder: SortOrder;
}

export default function useContests(): UseContestsReturn {
  // Main state to manage contests and loading/error states
  const [state, setState] = useState<UseContestsState>({
    contests: [],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      totalPages: 0,
      page: 1,
      limit: ITEMS_PER_PAGE,
    },
    totalCount: 0,
    isLoading: false,
    error: null,
  });

  // states for filters and search to manage input values
  const [filters, setFilters] = useState<ContestFilters>({});
  const [search, setSearch] = useState<string>('');

  // Request state to manage API request parameters
  const [request, setRequest] = useState<ContestListRequest>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    sortBy: ContestSortBy.START_TIME,
    sortOrder: SortOrder.DESC,
    ...filters,
  });

  // Fetch contests function
  const fetchContests = useCallback(
    async (requestParams: ContestListRequest) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const axiosResponse =
          await ContestsService.getContestList(requestParams);

        const data = axiosResponse?.data?.data.data;
        const pageInfo = axiosResponse?.data?.data.meta;

        setState((prev) => ({
          ...prev,
          contests:
            requestParams.page === 1 ? data : [...prev.contests, ...data],
          pageInfo: {
            hasNextPage: pageInfo.hasNextPage,
            hasPreviousPage: pageInfo.hasPreviousPage,
            totalPages: pageInfo.totalPages,
            page: pageInfo.page,
            limit: pageInfo.limit,
          },
          totalCount: pageInfo.total,
          isLoading: false,
        }));
      } catch (err) {
        console.error('Error fetching contests:', err);
        setState((prev) => ({
          ...prev,
          error: "Can't load the contests.",
          isLoading: false,
        }));
      }
    },
    []
  );

  // Effect to fetch contests when request changes
  useEffect(() => {
    fetchContests(request);
  }, [request, fetchContests]);

  // Helper function to update request
  const updateRequest = useCallback(
    (updates: Partial<ContestListRequest>, clearContests = false) => {
      if (clearContests) {
        setState((prev) => ({ ...prev, contests: [] }));
      }

      setRequest((prev) => ({
        ...prev,
        ...updates,
      }));
    },
    []
  );

  // Debounced search for search term
  const debouncedSearch = useDebouncedCallback(
    (searchTerm: string, currentFilters: ContestFilters) => {
      updateRequest(
        {
          search: searchTerm.trim() || undefined,
          ...currentFilters,
          page: 1,
        },
        true
      );
    },
    500
  );

  // handle filter changes
  const handleFiltersChange = useCallback(
    (newFilters: ContestFilters) => {
      setFilters(newFilters);
      updateRequest(
        {
          ...newFilters,
          search: search.trim() || undefined,
          page: 1,
        },
        true
      );
    },
    [search, updateRequest]
  );

  const handleSearchChange = useCallback(
    (newSearch: string) => {
      setSearch(newSearch);
      debouncedSearch(newSearch, filters);
    },
    [filters, debouncedSearch]
  );

  // handle sorting changes
  const handleSortByChange = useCallback(
    (newSortBy: ContestSortBy) => {
      updateRequest({ sortBy: newSortBy, page: 1 });
    },
    [updateRequest]
  );

  const handleSortOrderChange = useCallback(
    (newSortOrder: SortOrder) => {
      updateRequest({ sortOrder: newSortOrder, page: 1 });
    },
    [updateRequest]
  );

  // Load more contests for pagination
  const handleLoadMore = useCallback(() => {
    if (state.isLoading || !state.pageInfo?.hasNextPage) {
      return;
    }

    updateRequest(
      {
        page: state.pageInfo.page + 1,
      },
      false
    );
  }, [state.isLoading, state.pageInfo, updateRequest]);

  const handleReset = useCallback(() => {
    setSearch('');
    setFilters({
      startAfter: undefined,
      startBefore: undefined,
      status: undefined,
      userStatus: undefined,
    });

    updateRequest(
      {
        search: undefined,
        startAfter: undefined,
        startBefore: undefined,
        status: undefined,
        userStatus: undefined,
        page: 1,
        sortBy: ContestSortBy.START_TIME,
        sortOrder: SortOrder.DESC,
      },
      true
    );
  }, [updateRequest]);

  return {
    // State
    contests: state.contests,
    pageInfo: state.pageInfo,
    totalCount: state.totalCount,
    isLoading: state.isLoading,
    error: state.error,

    // Expose request state for UI
    search: search,
    filters: filters,
    sortBy: request.sortBy || ContestSortBy.START_TIME,
    sortOrder: request.sortOrder || SortOrder.DESC,

    // Actions
    handleSearchChange,
    handleFiltersChange,
    handleReset,
    handleLoadMore,
    handleSortByChange,
    handleSortOrderChange,
  };
}
