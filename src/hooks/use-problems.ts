import { ProblemsService } from '@/services/problems-service';
import { TagsService } from '@/services/tags-service';
import { TopicsService } from '@/services/topics-service';
import { favoriteListService } from '@/services/favorite-list-service';
import {
  type GetProblemListRequest,
  type Problem,
  type ProblemFilters,
  type ProblemMeta,
  ProblemStatus,
  SortBy,
  SortOrder,
} from '@/types/problems';
import type { Tag } from '@/types/tags';
import type { Topic } from '@/types/topics';
import { useCallback, useEffect, useState } from 'react';

const ITEMS_PER_PAGE = 20;

interface UseProblemsState {
  problems: Problem[];
  meta: ProblemMeta | null;
  isLoading: boolean;
  error: string | null;
}

interface UseProblemsActions {
  handleFiltersChange: (newFilters: ProblemFilters) => void;
  handleKeywordChange: (newKeyword: string) => void;
  handleSortByChange: (newSortBy: SortBy) => void;
  handleSortOrderChange: (newSortOrder: SortOrder) => void;
  handleSearch: () => void;
  handleReset: () => void;
  handlePageChange: (page: number) => void;
  handleLoadMore: () => void;
  refresh: () => void;
}

interface UseProblemsReturn extends UseProblemsState, UseProblemsActions {
  totalCount: number;
  // Request params (exposed for UI)
  filters: ProblemFilters;
  keyword: string;
  sortBy: SortBy;
  sortOrder: SortOrder;

  // Metadata
  tags: Tag[];
  topics: Topic[];
  isMetadataLoading: boolean;

  // Page Info
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
}

export default function useProblems(): UseProblemsReturn {
  // Main state to manage problems and loading/error states
  const [state, setState] = useState<UseProblemsState>({
    problems: [],
    meta: null,
    isLoading: false,
    error: null,
  });

  // Metadata state
  const [tags, setTags] = useState<Tag[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isMetadataLoading, setIsMetadataLoading] = useState(false);

  // states for filters and keyword to manage input values
  const [filters, setFilters] = useState<ProblemFilters>({ isActive: true });
  const [keyword, setKeyword] = useState<string>('');

  // state for sorting
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.ID);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);

  // Request state to manage API request parameters
  const [request, setRequest] = useState<GetProblemListRequest>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    sortBy: sortBy || SortBy.ID,
    sortOrder: sortOrder || SortOrder.ASC,
    filters: {
      ...filters,
      isActive: true,
    },
  });

  // Fetch metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      setIsMetadataLoading(true);
      try {
        const [tagsData, topicsData] = await Promise.all([
          TagsService.getAllTags(),
          TopicsService.getAllTopics(),
        ]);
        setTags(tagsData || []);
        setTopics(topicsData || []);
      } catch (error) {
        console.error('Failed to fetch metadata:', error);
      } finally {
        setIsMetadataLoading(false);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch problems function
  const fetchProblems = useCallback(
    async (requestParams: GetProblemListRequest) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        let data: Problem[] = [];
        let meta: ProblemMeta | null = null;

        if (requestParams.filters?.listId) {
          const listId = parseInt(requestParams.filters.listId);
          if (!isNaN(listId)) {
            const problems = await favoriteListService.getProblems(listId);
            data = Array.isArray(problems) ? problems : [];
            meta = {
              page: 1,
              limit: data.length > 0 ? data.length : 10,
              total: data.length,
              totalPages: 1,
              hasPreviousPage: false,
              hasNextPage: false,
            };
          }
        } else {
          const response = await ProblemsService.getProblemList(requestParams);
          data = response?.data?.data?.data || [];
          meta = response?.data?.data?.meta || null;
        }

        setState((prev) => ({
          ...prev,
          problems:
            requestParams.page === 1
              ? data
              : [...prev.problems, ...data],
          meta: meta,
          isLoading: false,
        }));
      } catch (err) {
        console.error('Error fetching problems:', err);
        setState((prev) => ({
          ...prev,
          error: "Can't load the problems.",
          isLoading: false,
        }));
      }
    },
    []
  );

  // Effect to fetch problems when request changes
  useEffect(() => {
    fetchProblems(request);
  }, [request, fetchProblems]);

  // Helper function to update request
  const updateRequest = useCallback(
    (updates: Partial<GetProblemListRequest>) => {
      setRequest((prev) => ({
        ...prev,
        ...updates,
      }));
    },
    []
  );

  // handle filter, keyword changes
  const handleFiltersChange = useCallback(
    (newFilters: ProblemFilters) => {
      const filtersWithActive = { ...newFilters, isActive: true };
      setFilters(filtersWithActive);

      // When filters change, reset to page 1
      updateRequest({ filters: filtersWithActive, page: 1 });
    },
    [updateRequest]
  );

  const handleKeywordChange = useCallback((newKeyword: string) => {
    setKeyword(newKeyword);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateRequest({
        search: keyword.trim() || undefined,
        page: 1,
      });
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [keyword, updateRequest]);

  // handle sorting changes
  const handleSortByChange = useCallback(
    (newSortBy: SortBy) => {
      setSortBy(newSortBy);
      updateRequest({ sortBy: newSortBy, page: 1 });
    },
    [updateRequest]
  );

  const handleSortOrderChange = useCallback(
    (newSortOrder: SortOrder) => {
      setSortOrder(newSortOrder);
      updateRequest({ sortOrder: newSortOrder, page: 1 });
    },
    [updateRequest]
  );

  // handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      updateRequest({ page });
    },
    [updateRequest]
  );

  const handleLoadMore = useCallback(() => {
    if (state.meta?.hasNextPage) {
      updateRequest({ page: (state.meta.page || 0) + 1 });
    }
  }, [state.meta, updateRequest]);

  // handle search (now just forces a refresh if needed, but debounce handles typing)
  const handleSearch = useCallback(() => {
    const trimmedKeyword = keyword.trim();
    updateRequest({
      search: trimmedKeyword || undefined,
      filters: { ...filters },
      page: 1,
    });
  }, [keyword, filters, updateRequest]);

  const handleReset = useCallback(() => {
    setFilters({ isActive: true });
    setKeyword('');
    setSortBy(SortBy.ID);
    setSortOrder(SortOrder.ASC);

    updateRequest({
      search: undefined,
      filters: { isActive: true },
      page: 1,
      sortBy: SortBy.ID,
      sortOrder: SortOrder.ASC,
    });
  }, [updateRequest]);

  const refresh = useCallback(() => {
    fetchProblems(request);
  }, [fetchProblems, request]);

  return {
    // State
    problems: state.problems,
    meta: state.meta,
    totalCount: state.meta?.total || 0,
    isLoading: state.isLoading,
    error: state.error,

    // Request params (exposed for UI)
    filters,
    keyword,
    sortBy,
    sortOrder,

    // Metadata
    tags,
    topics,
    isMetadataLoading,

    // Page Info
    pageInfo: {
      hasNextPage: state.meta?.hasNextPage || false,
      hasPreviousPage: state.meta?.hasPreviousPage || false,
    },

    // Handlers
    handleFiltersChange,
    handleKeywordChange,
    handleSortByChange,
    handleSortOrderChange,
    handleSearch,
    handleReset,
    handlePageChange,
    handleLoadMore,
    refresh,
  };
}
