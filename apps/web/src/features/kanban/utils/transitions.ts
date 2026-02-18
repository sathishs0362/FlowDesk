import type { Task, TaskStatus, User } from '../../../types/domain';

export const KANBAN_COLUMNS: TaskStatus[] = [
  'DRAFT',
  'IN_PROGRESS',
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
];

export const canDragTask = (task: Task, user: User | null): boolean => {
  if (!user || task.status === 'APPROVED') {
    return false;
  }

  if (user.role === 'employee') {
    if (task.assignedToId !== user.id) {
      return false;
    }
    return task.status === 'DRAFT' || task.status === 'IN_PROGRESS';
  }

  return task.status === 'SUBMITTED';
};

export const canMoveTask = (
  task: Task,
  targetStatus: TaskStatus,
  user: User | null,
): boolean => {
  if (!user || task.status === 'APPROVED' || task.status === targetStatus) {
    return false;
  }

  if (user.role === 'employee') {
    if (task.assignedToId !== user.id) {
      return false;
    }

    if (task.status === 'DRAFT' && targetStatus === 'IN_PROGRESS') {
      return true;
    }

    if (task.status === 'IN_PROGRESS' && targetStatus === 'SUBMITTED') {
      return true;
    }

    return false;
  }

  if (user.role === 'admin' || user.role === 'manager') {
    return task.status === 'SUBMITTED' && (targetStatus === 'APPROVED' || targetStatus === 'REJECTED');
  }

  return false;
};

export const groupTasksByStatus = (tasks: Task[]): Record<TaskStatus, Task[]> => {
  const grouped: Record<TaskStatus, Task[]> = {
    DRAFT: [],
    IN_PROGRESS: [],
    SUBMITTED: [],
    APPROVED: [],
    REJECTED: [],
  };

  tasks.forEach((task) => {
    grouped[task.status].push(task);
  });

  return grouped;
};
