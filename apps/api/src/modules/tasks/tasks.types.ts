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
