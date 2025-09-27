/* eslint-disable @typescript-eslint/no-explicit-any */
// =============================================================================
// DATA FETCHING HOOKS
// =============================================================================

import { useState, useEffect, useCallback, useRef } from "react";
import { ApiResponse, LoadingState } from "@/types";
import { apiClient } from "@/lib/api/client";
import { handleClientError } from "@/lib/errors";

interface UseApiOptions {
  enabled?: boolean;
  retries?: number;
  cacheTime?: number;
  staleTime?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

interface UseApiResult<T> extends LoadingState {
  data: T | null;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
}

// Simple cache implementation
class QueryCache {
  private cache = new Map<
    string,
    { data: any; timestamp: number; staleTime: number }
  >();

  set(key: string, data: any, staleTime: number = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      staleTime,
    });
  }

  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isStale = Date.now() - cached.timestamp > cached.staleTime;
    if (isStale) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  invalidate(key: string) {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: RegExp) {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear() {
    this.cache.clear();
  }
}

const queryCache = new QueryCache();

// Main data fetching hook
export function useApi<T = any>(
  endpoint: string | null,
  options: UseApiOptions = {}
): UseApiResult<T> {
  const {
    enabled = true,
    retries = 3,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 1 * 60 * 1000, // 1 minute
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<{
    data: T | null;
    isLoading: boolean;
    error: string | null;
  }>({
    data: null,
    isLoading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(
    async (bypassCache = false) => {
      if (!endpoint) return;

      // Check cache first (if not bypassing)
      if (!bypassCache) {
        const cachedData = queryCache.get(endpoint);
        if (cachedData) {
          setState({
            data: cachedData,
            isLoading: false,
            error: null,
          });
          onSuccess?.(cachedData);
          return;
        }
      }

      // Abort previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const response = await apiClient.get<T>(endpoint, {
          retries,
          signal: abortControllerRef.current.signal,
        });

        // Cache the response
        queryCache.set(endpoint, response.data, staleTime);

        setState({
          data: response.data,
          isLoading: false,
          error: null,
        });

        onSuccess?.(response.data);
      } catch (error: any) {
        // Don't update state if request was aborted
        if (error.name === "AbortError") return;

        const errorMessage = handleClientError(error);
        setState({
          data: null,
          isLoading: false,
          error: errorMessage,
        });

        onError?.(errorMessage);
      }
    },
    [endpoint, retries, staleTime, onSuccess, onError]
  );

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  const mutate = useCallback(
    (newData: T) => {
      setState((prev) => ({
        ...prev,
        data: newData,
      }));

      // Update cache
      if (endpoint) {
        queryCache.set(endpoint, newData, staleTime);
      }
    },
    [endpoint, staleTime]
  );

  useEffect(() => {
    if (enabled) {
      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, fetchData]);

  return {
    ...state,
    refetch,
    mutate,
  };
}

// Hook for mutations (POST, PUT, DELETE)
interface UseMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  onSettled?: () => void;
  invalidateQueries?: string[];
  optimisticUpdate?: (currentData: any) => any;
}

interface UseMutationResult<T, V = any> {
  mutate: (variables: V) => Promise<void>;
  mutateAsync: (variables: V) => Promise<T>;
  data: T | null;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export function useMutation<T = any, V = any>(
  mutationFn: (variables: V) => Promise<ApiResponse<T>>,
  options: UseMutationOptions<T> = {}
): UseMutationResult<T, V> {
  const {
    onSuccess,
    onError,
    onSettled,
    invalidateQueries = [],
    optimisticUpdate,
  } = options;

  const [state, setState] = useState<{
    data: T | null;
    isLoading: boolean;
    error: string | null;
  }>({
    data: null,
    isLoading: false,
    error: null,
  });

  const mutateAsync = useCallback(
    async (variables: V): Promise<T> => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const response = await mutationFn(variables);

        setState({
          data: response.data,
          isLoading: false,
          error: null,
        });

        // Invalidate specified queries
        invalidateQueries.forEach((pattern) => {
          queryCache.invalidatePattern(new RegExp(pattern));
        });

        onSuccess?.(response.data);
        return response.data;
      } catch (error: any) {
        const errorMessage = handleClientError(error);
        setState({
          data: null,
          isLoading: false,
          error: errorMessage,
        });

        onError?.(errorMessage);
        throw error;
      } finally {
        onSettled?.();
      }
    },
    [mutationFn, onSuccess, onError, onSettled, invalidateQueries]
  );

  const mutate = useCallback(
    async (variables: V) => {
      try {
        await mutateAsync(variables);
      } catch {
        // Error is already handled in mutateAsync
      }
    },
    [mutateAsync]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    mutate,
    mutateAsync,
    reset,
  };
}

// Hook for paginated data
interface UsePaginatedApiOptions extends UseApiOptions {
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UsePaginatedApiResult<T> extends LoadingState {
  data: T[];
  pagination: PaginatedResponse<T>["pagination"] | null;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
  hasNextPage: boolean;
  isFetchingMore: boolean;
}

export function usePaginatedApi<T = any>(
  endpoint: string | null,
  options: UsePaginatedApiOptions = {}
): UsePaginatedApiResult<T> {
  const { page = 1, limit = 10, ...restOptions } = options;

  const [allData, setAllData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<
    PaginatedResponse<T>["pagination"] | null
  >(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const paginatedEndpoint = endpoint
    ? `${endpoint}?page=${page}&limit=${limit}`
    : null;

  const {
    data,
    isLoading,
    error,
    refetch: refetchBase,
  } = useApi<PaginatedResponse<T>>(paginatedEndpoint, restOptions);

  useEffect(() => {
    if (data) {
      if (page === 1) {
        setAllData(data.data);
      } else {
        setAllData((prev) => [...prev, ...data.data]);
      }
      setPagination(data.pagination);
    }
  }, [data, page]);

  const loadMore = useCallback(async () => {
    if (!pagination || !endpoint || isFetchingMore || !pagination.totalPages)
      return;

    if (pagination.page >= pagination.totalPages) return;

    setIsFetchingMore(true);
    try {
      const nextPage = pagination.page + 1;
      const response = await apiClient.get<PaginatedResponse<T>>(
        `${endpoint}?page=${nextPage}&limit=${limit}`
      );

      setAllData((prev) => [...prev, ...response.data.data]);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error loading more data:", error);
    } finally {
      setIsFetchingMore(false);
    }
  }, [pagination, endpoint, limit, isFetchingMore]);

  const refetch = useCallback(async () => {
    setAllData([]);
    setPagination(null);
    await refetchBase();
  }, [refetchBase]);

  const hasNextPage = pagination
    ? pagination.page < pagination.totalPages
    : false;

  return {
    data: allData,
    pagination,
    isLoading,
    error,
    isFetchingMore,
    hasNextPage,
    loadMore,
    refetch,
  };
}

// Export cache utilities for manual cache management
export const cacheUtils = {
  invalidate: (key: string) => queryCache.invalidate(key),
  invalidatePattern: (pattern: RegExp) => queryCache.invalidatePattern(pattern),
  clear: () => queryCache.clear(),
};
