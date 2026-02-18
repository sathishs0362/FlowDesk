import { api } from '../../services/api';
import type { AppDispatch, RootState } from '../../app/store';
import type { ApiSuccessResponse } from '../../types/api';
import type { Task, TaskStatus } from '../../types/domain';
import { addToast } from '../../app/ui.slice';
import { tasksAdapter, tasksSelectors } from './tasks.adapter';

interface CreateTaskRequest {
  title: string;
  description?: string;
  projectId: string;
  assignedToId: string;
}

export interface TasksQueryParams {
  page?: number;
  limit?: number;
  projectId?: string;
  assignedToId?: string;
  status?: TaskStatus;
  search?: string;
}

interface UpdateTaskStatusRequest {
  id: string;
  status: TaskStatus;
  comment?: string;
}

export interface TasksMeta {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface NormalizedTasksResult {
  tasks: ReturnType<typeof tasksAdapter.getInitialState>;
  meta: TasksMeta;
}

const normalizeTasks = (items: Task[]): ReturnType<typeof tasksAdapter.getInitialState> => {
  return tasksAdapter.setAll(tasksAdapter.getInitialState(), items);
};

const defaultMeta: TasksMeta = {
  total: 0,
  page: 1,
  limit: 25,
  hasMore: false,
};

const buildQueryParams = (arg?: TasksQueryParams) => ({
  page: arg?.page ?? 1,
  limit: arg?.limit ?? 25,
  projectId: arg?.projectId,
  assignedToId: arg?.assignedToId,
  status: arg?.status,
  search: arg?.search,
});

interface UndoPatch {
  undo: () => void;
}

const patchTaskAcrossCaches = (
  dispatch: AppDispatch,
  state: RootState,
  taskId: string,
  updater: (task: Task) => void,
): UndoPatch[] => {
  const patchCollections: UndoPatch[] = [];
  const getTasksArgs = tasksApi.util.selectCachedArgsForQuery(state, 'getTasks');
  const getTasksFeedArgs = tasksApi.util.selectCachedArgsForQuery(state, 'getTasksFeed');

  getTasksArgs.forEach((args) => {
    patchCollections.push(
      dispatch(
        tasksApi.util.updateQueryData('getTasks', args, (draft) => {
          const task = draft.tasks.entities[taskId];
          if (task) {
            updater(task);
          }
        }),
      ) as UndoPatch,
    );
  });

  getTasksFeedArgs.forEach((args) => {
    patchCollections.push(
      dispatch(
        tasksApi.util.updateQueryData('getTasksFeed', args, (draft) => {
          const task = draft.tasks.entities[taskId];
          if (task) {
            updater(task);
          }
        }),
      ) as UndoPatch,
    );
  });

  return patchCollections;
};

export const tasksApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<NormalizedTasksResult, TasksQueryParams | undefined>({
      query: (arg) => ({
        url: '/tasks',
        method: 'GET',
        params: buildQueryParams(arg),
      }),
      transformResponse: (response: ApiSuccessResponse<Task[], TasksMeta>) => ({
        tasks: normalizeTasks(response.data),
        meta: response.meta ?? defaultMeta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...tasksSelectors.selectIds(result.tasks).map((id) => ({ type: 'Tasks' as const, id })),
              { type: 'Tasks' as const, id: 'LIST' },
            ]
          : [{ type: 'Tasks' as const, id: 'LIST' }],
    }),
    getTasksFeed: builder.query<NormalizedTasksResult, TasksQueryParams | undefined>({
      query: (arg) => ({
        url: '/tasks',
        method: 'GET',
        params: buildQueryParams(arg),
      }),
      transformResponse: (response: ApiSuccessResponse<Task[], TasksMeta>) => ({
        tasks: normalizeTasks(response.data),
        meta: response.meta ?? defaultMeta,
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const filters = queryArgs ? { ...queryArgs } : {};
        delete filters.page;
        return `${endpointName}:${JSON.stringify({ ...filters, limit: queryArgs?.limit ?? 25 })}`;
      },
      merge: (currentCache, incoming) => {
        if (incoming.meta.page <= 1) {
          currentCache.tasks = incoming.tasks;
          currentCache.meta = incoming.meta;
          return;
        }

        tasksAdapter.upsertMany(
          currentCache.tasks,
          tasksSelectors.selectAll(incoming.tasks),
        );
        currentCache.meta = incoming.meta;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
      providesTags: (result) =>
        result
          ? [
              ...tasksSelectors.selectIds(result.tasks).map((id) => ({ type: 'Tasks' as const, id })),
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
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(addToast({ type: 'success', message: 'Task created successfully.' }));
        } catch {
          // handled by global RTK Query middleware
        }
      },
      invalidatesTags: [{ type: 'Tasks', id: 'LIST' }],
    }),
    updateTaskStatus: builder.mutation<Task, UpdateTaskStatusRequest>({
      query: ({ id, ...payload }) => ({
        url: `/tasks/${id}/status`,
        method: 'PATCH',
        data: payload,
      }),
      transformResponse: (response: ApiSuccessResponse<Task>) => response.data,
      async onQueryStarted({ id, status }, { dispatch, queryFulfilled, getState }) {
        const optimisticPatches = patchTaskAcrossCaches(
          dispatch,
          getState() as RootState,
          id,
          (task) => {
            task.status = status;
          },
        );

        try {
          const { data: updatedTask } = await queryFulfilled;
          patchTaskAcrossCaches(dispatch, getState() as RootState, updatedTask.id, (task) => {
            Object.assign(task, updatedTask);
          });
          dispatch(addToast({ type: 'success', message: 'Task status updated.' }));
        } catch {
          optimisticPatches.forEach((patch) => patch.undo());
        }
      },
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTasksFeedQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
} = tasksApi;
