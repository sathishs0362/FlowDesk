import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '../../../hooks/auth';
import { useAppDispatch } from '../../../hooks/redux';
import { addToast } from '../../../app/ui.slice';
import type { Task, TaskStatus } from '../../../types/domain';
import { tasksSelectors } from '../../tasks/tasks.adapter';
import type { TaskFilters } from '../../tasks/hooks/useTasks';
import { useGetTasksFeedQuery, useUpdateTaskStatusMutation } from '../../tasks/tasks.api';
import {
  canDragTask,
  canMoveTask,
  groupTasksByStatus,
  KANBAN_COLUMNS,
} from '../utils/transitions';
import { useGetProjectsQuery } from '../../projects/projects.api';
import { useWorkspace } from '../../../hooks/useWorkspace';

interface DragMeta {
  taskId: string;
  fromStatus: TaskStatus;
}

export const useKanbanBoard = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { currentWorkspaceId } = useWorkspace();
  const { data: projects = [] } = useGetProjectsQuery();
  const [filters, setFilters] = useState<TaskFilters>({});
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useGetTasksFeedQuery(
    {
      page,
      limit: 40,
      ...filters,
    },
    {
      selectFromResult: ({ data, isLoading, isFetching }) => ({
        data,
        isLoading,
        isFetching,
      }),
    },
  );
  const [updateTaskStatus, updateState] = useUpdateTaskStatusMutation();
  const [activeDrag, setActiveDrag] = useState<DragMeta | null>(null);
  const [hoverStatus, setHoverStatus] = useState<TaskStatus | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  const workspaceProjectIds = useMemo(
    () =>
      new Set(
        projects
          .filter((project) => !project.workspaceId || project.workspaceId === currentWorkspaceId)
          .map((project) => project.id),
      ),
    [currentWorkspaceId, projects],
  );
  const tasks = useMemo(
    () => (data ? tasksSelectors.selectAll(data.tasks).filter((task) => workspaceProjectIds.has(task.projectId)) : []),
    [data, workspaceProjectIds],
  );
  const groupedTasks = useMemo(() => groupTasksByStatus(tasks), [tasks]);
  const tasksById = useMemo(
    () => Object.fromEntries(tasks.map((task) => [task.id, task])),
    [tasks],
  );
  const activeTask = useMemo(
    () => (activeDrag ? tasks.find((entry) => entry.id === activeDrag.taskId) ?? null : null),
    [activeDrag, tasks],
  );

  const allowedDropTargets = useMemo(() => {
    if (!activeDrag) {
      return KANBAN_COLUMNS;
    }

    const task = activeTask;

    if (!task) {
      return KANBAN_COLUMNS;
    }

    return KANBAN_COLUMNS.filter((status) => canMoveTask(task, status, user));
  }, [activeDrag, activeTask, user]);

  const onDragStart = useCallback((event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task | undefined;

    if (!task || !canDragTask(task, user)) {
      setActiveDrag(null);
      return;
    }

    setActiveDrag({
      taskId: task.id,
      fromStatus: task.status,
    });
    setHoverStatus(task.status);
  }, [user]);

  const onDragOver = useCallback((event: DragOverEvent) => {
    const overId = event.over?.id;
    if (!overId || typeof overId !== 'string') {
      setHoverStatus(null);
      return;
    }

    setHoverStatus(overId as TaskStatus);
  }, []);

  const onDragEnd = useCallback(async (event: DragEndEvent) => {
    if (!activeDrag) {
      return;
    }

    const overId = event.over?.id;
    setActiveDrag(null);
    setHoverStatus(null);

    if (!overId || typeof overId !== 'string') {
      return;
    }

    const targetStatus = overId as TaskStatus;
    const task = tasks.find((entry) => entry.id === activeDrag.taskId) ?? activeTask;

    if (!task) {
      return;
    }

    if (!canMoveTask(task, targetStatus, user)) {
      dispatch(addToast({ type: 'info', message: 'That move is not allowed for your role.' }));
      return;
    }

    if (targetStatus === 'SUBMITTED' && task.blockedByTaskIds?.length) {
      const unresolved = task.blockedByTaskIds.some((dependencyId) => {
        const dependency = tasksById[dependencyId];
        return dependency && dependency.status !== 'APPROVED';
      });

      if (unresolved) {
        dispatch(addToast({ type: 'info', message: 'Cannot submit: dependencies are incomplete.' }));
        return;
      }
    }

    const comment =
      targetStatus === 'APPROVED' || targetStatus === 'REJECTED'
        ? 'Reviewed from FlowDesk Kanban'
        : undefined;

    if (targetStatus === 'APPROVED' || targetStatus === 'REJECTED') {
      const confirmed = window.confirm(
        targetStatus === 'APPROVED'
          ? 'Confirm approving this task?'
          : 'Confirm rejecting this task?',
      );

      if (!confirmed) {
        return;
      }
    }

    try {
      await updateTaskStatus({
        id: task.id,
        status: targetStatus,
        comment,
      }).unwrap();
    } catch {
      // rollback and toast handled in API lifecycle + global middleware
    }
  }, [activeDrag, activeTask, dispatch, tasks, tasksById, updateTaskStatus, user]);

  const onDragCancel = useCallback(() => {
    setActiveDrag(null);
    setHoverStatus(null);
  }, []);

  const loadMore = useCallback(() => {
    if (!data?.meta.hasMore || isFetching) {
      return;
    }

    setPage((current) => current + 1);
  }, [data?.meta.hasMore, isFetching]);

  const updateFilters = useCallback((next: TaskFilters) => {
    setPage(1);
    setFilters(next);
  }, []);
  const canDragTaskForUser = useCallback((task: Task) => canDragTask(task, user), [user]);
  const toggleTaskSelection = useCallback((taskId: string) => {
    setSelectedTaskIds((current) =>
      current.includes(taskId) ? current.filter((id) => id !== taskId) : [...current, taskId],
    );
  }, []);
  const clearSelectedTasks = useCallback(() => setSelectedTaskIds([]), []);
  const moveSelectedTasks = useCallback(async (targetStatus: TaskStatus) => {
    const selectedTasks = selectedTaskIds
      .map((taskId) => tasksById[taskId])
      .filter((task): task is Task => Boolean(task));

    for (const task of selectedTasks) {
      if (!canMoveTask(task, targetStatus, user)) {
        continue;
      }

      if (targetStatus === 'SUBMITTED' && task.blockedByTaskIds?.length) {
        const unresolved = task.blockedByTaskIds.some((dependencyId) => {
          const dependency = tasksById[dependencyId];
          return dependency && dependency.status !== 'APPROVED';
        });

        if (unresolved) {
          dispatch(addToast({ type: 'info', message: `Cannot submit "${task.title}": dependencies are incomplete.` }));
          continue;
        }
      }

      try {
        await updateTaskStatus({
          id: task.id,
          status: targetStatus,
          comment:
            targetStatus === 'APPROVED' || targetStatus === 'REJECTED'
              ? 'Batch-reviewed from FlowDesk Kanban'
              : undefined,
        }).unwrap();
      } catch {
        dispatch(addToast({ type: 'error', message: `Failed to move "${task.title}"` }));
      }
    }

    setSelectedTaskIds([]);
  }, [dispatch, selectedTaskIds, tasksById, user, updateTaskStatus]);

  return {
    groupedTasks,
    allowedDropTargets,
    hoverStatus,
    activeDrag,
    activeTask,
    loading: isLoading,
    fetching: isFetching || updateState.isLoading,
    hasMore: Boolean(data?.meta.hasMore),
    total: data?.meta.total ?? 0,
    filters,
    updateFilters,
    selectedTaskIds,
    toggleTaskSelection,
    clearSelectedTasks,
    moveSelectedTasks,
    loadMore,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel,
    canDragTask: canDragTaskForUser,
  };
};
