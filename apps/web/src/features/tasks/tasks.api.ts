
import { api } from '../../services/api';
import type { ApiSuccessResponse } from '../../types/api';
import type { Task, TaskStatus } from '../../types/domain';

interface CreateTaskRequest {
  title: string;
  description?: string;
  projectId: string;
  assignedToId: string;
}

interface UpdateTaskStatusRequest {
  id: string;
  status: TaskStatus;
  comment?: string;
}

export const tasksApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], void>({
      query: () => ({ url: '/tasks', method: 'GET' }),
      transformResponse: (response: ApiSuccessResponse<Task[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map((task) => ({ type: 'Tasks' as const, id: task.id })),
              { type: 'Tasks' as const, id: 'LIST' },
            ]
          : [{ type: 'Tasks' as const, id: 'LIST' }],
    }),
    createTask: builder.mutation<Task, CreateTaskRequest>({
      query: (payload) => ({
        url: '/tasks',
        method: 'POST',
        data: payload,
      }),
      transformResponse: (response: ApiSuccessResponse<Task>) => response.data,
      invalidatesTags: [{ type: 'Tasks', id: 'LIST' }],
    }),
    updateTaskStatus: builder.mutation<Task, UpdateTaskStatusRequest>({
      query: ({ id, ...payload }) => ({
        url: `/tasks/${id}/status`,
        method: 'PATCH',
        data: payload,
      }),
      transformResponse: (response: ApiSuccessResponse<Task>) => response.data,
      async onQueryStarted({ id, status }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          tasksApi.util.updateQueryData('getTasks', undefined, (draft) => {
            const task = draft.find((entry) => entry.id === id);
            if (task) {
              task.status = status;
            }
          }),
        );

        try {
          const { data: updatedTask } = await queryFulfilled;
          dispatch(
            tasksApi.util.updateQueryData('getTasks', undefined, (draft) => {
              const task = draft.find((entry) => entry.id === updatedTask.id);
              if (task) {
                Object.assign(task, updatedTask);
              }
            }),
          );
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const { useGetTasksQuery, useCreateTaskMutation, useUpdateTaskStatusMutation } = tasksApi;
