import { TaskStatus } from "@prisma/client";

export interface CreateTaskInput {
  title: string;
  description?: string;
  projectId: string;
  assignedToId: string;
}

export interface UpdateTaskStatusInput {
  status: TaskStatus;
  comment?: string;
}

export interface GetTasksQuery {
  page: number;
  limit: number;
  projectId?: string;
  assignedToId?: string;
  status?: TaskStatus;
  search?: string;
}

export interface PaginatedTasksResult<TTask> {
  items: TTask[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
