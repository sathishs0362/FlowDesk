import { createEntityAdapter } from '@reduxjs/toolkit';
import type { Task } from '../../types/domain';

export const tasksAdapter = createEntityAdapter<Task>({
  sortComparer: (a, b) => b.createdAt.localeCompare(a.createdAt),
});

export type TasksEntityState = ReturnType<typeof tasksAdapter.getInitialState>;

export const tasksSelectors = tasksAdapter.getSelectors<TasksEntityState>((state) => state);
