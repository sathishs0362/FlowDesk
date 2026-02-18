import { useCallback, useMemo, useState } from 'react';
import type { TaskStatus } from '../../../types/domain';
import { useGetTasksQuery } from '../tasks.api';
import { tasksSelectors } from '../tasks.adapter';

export interface TaskFilters {
  projectId?: string;
  assignedToId?: string;
  status?: TaskStatus;
  search?: string;
}

interface UseTasksOptions {
  limit?: number;
  initialFilters?: TaskFilters;
}

export const useTasks = ({ limit = 25, initialFilters }: UseTasksOptions = {}) => {
  const [filters, setFilters] = useState<TaskFilters>(initialFilters ?? {});
  const [page, setPage] = useState(1);
  const safeLimit = Math.min(100, Math.max(1, limit));

  const queryArgs = useMemo(
    () => ({
      page,
      limit: safeLimit,
      ...filters,
    }),
    [filters, page, safeLimit],
  );

  const query = useGetTasksQuery(queryArgs, {
    selectFromResult: ({ data, isLoading, isFetching, error }) => ({
      tasks: data ? tasksSelectors.selectAll(data.tasks) : [],
      meta: data?.meta,
      isLoading,
      isFetching,
      error,
    }),
  });

  const updateFilters = useCallback((next: TaskFilters) => {
    setPage(1);
    setFilters(next);
  }, []);

  const clearFilters = useCallback(() => {
    setPage(1);
    setFilters({});
  }, []);

  const nextPage = useCallback(() => {
    setPage((current) => current + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage((current) => Math.max(1, current - 1));
  }, []);

  return {
    ...query,
    page,
    filters,
    setPage,
    nextPage,
    prevPage,
    updateFilters,
    clearFilters,
  };
};
