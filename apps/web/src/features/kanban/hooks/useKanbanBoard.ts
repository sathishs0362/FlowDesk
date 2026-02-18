import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useMemo, useState } from 'react';
import { useAuth } from '../../../hooks/auth';
import { useAppDispatch } from '../../../hooks/redux';
import { addToast } from '../../../app/ui.slice';
import type { Task, TaskStatus } from '../../../types/domain';
import { useGetTasksQuery, useUpdateTaskStatusMutation } from '../../tasks/tasks.api';
import {
  canDragTask,
  canMoveTask,
  groupTasksByStatus,
  KANBAN_COLUMNS,
} from '../utils/transitions';

interface DragMeta {
  taskId: string;
  fromStatus: TaskStatus;
}

export const useKanbanBoard = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { data: tasks = [], isFetching } = useGetTasksQuery(undefined, {
    selectFromResult: ({ data, isFetching }) => ({
      data,
      isFetching,
    }),
  });
  const [updateTaskStatus, updateState] = useUpdateTaskStatusMutation();
  const [activeDrag, setActiveDrag] = useState<DragMeta | null>(null);

  const groupedTasks = useMemo(() => groupTasksByStatus(tasks), [tasks]);

  const allowedDropTargets = useMemo(() => {
    if (!activeDrag) {
      return KANBAN_COLUMNS;
    }

    const task = tasks.find((entry) => entry.id === activeDrag.taskId);

    if (!task) {
      return KANBAN_COLUMNS;
    }

    return KANBAN_COLUMNS.filter((status) => canMoveTask(task, status, user));
  }, [activeDrag, tasks, user]);

  const onDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task | undefined;

    if (!task || !canDragTask(task, user)) {
      setActiveDrag(null);
      return;
    }

    setActiveDrag({
      taskId: task.id,
      fromStatus: task.status,
    });
  };

  const onDragEnd = async (event: DragEndEvent) => {
    if (!activeDrag) {
      return;
    }

    const overId = event.over?.id;
    setActiveDrag(null);

    if (!overId || typeof overId !== 'string') {
      return;
    }

    const targetStatus = overId as TaskStatus;
    const task = tasks.find((entry) => entry.id === activeDrag.taskId);

    if (!task) {
      return;
    }

    if (!canMoveTask(task, targetStatus, user)) {
      dispatch(addToast({ type: 'info', message: 'That move is not allowed for your role.' }));
      return;
    }

    const comment =
      targetStatus === 'APPROVED' || targetStatus === 'REJECTED'
        ? 'Reviewed from FlowDesk Kanban'
        : undefined;

    try {
      await updateTaskStatus({
        id: task.id,
        status: targetStatus,
        comment,
      }).unwrap();
    } catch {
      // Rollback handled by RTK Query onQueryStarted.
    }
  };

  return {
    groupedTasks,
    allowedDropTargets,
    activeDrag,
    loading: isFetching || updateState.isLoading,
    onDragStart,
    onDragEnd,
    canDragTask: (task: Task) => canDragTask(task, user),
  };
};
