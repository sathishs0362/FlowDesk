import { ApprovalStatus, Prisma, Role, Task, TaskStatus } from "@prisma/client";
import { AppError } from "../../common/AppError";
import { prisma } from "../../config/db";
import { createApproval } from "../approvals/approvals.service";
import {
  CreateTaskInput,
  GetTasksQuery,
  PaginatedTasksResult,
  UpdateTaskStatusInput,
} from "./tasks.types";

export const createTask = async (
  creatorId: string,
  input: CreateTaskInput,
): Promise<Task> => {
  const [project, assignee] = await Promise.all([
    prisma.project.findUnique({ where: { id: input.projectId } }),
    prisma.user.findUnique({ where: { id: input.assignedToId } }),
  ]);

  if (!project) {
    throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
  }

  if (!assignee) {
    throw new AppError(404, "ASSIGNEE_NOT_FOUND", "Assigned user not found");
  }

  if (assignee.role !== Role.employee) {
    throw new AppError(400, "INVALID_ASSIGNEE", "Tasks can only be assigned to employees");
  }

  return prisma.task.create({
    data: {
      title: input.title.trim(),
      description: input.description?.trim() || null,
      projectId: input.projectId,
      assignedToId: input.assignedToId,
      createdById: creatorId,
      status: TaskStatus.DRAFT,
    },
  });
};

export const getTasks = async (
  userId: string,
  role: Role,
  query: GetTasksQuery,
): Promise<PaginatedTasksResult<Task>> => {
  const where: Prisma.TaskWhereInput = {};

  if (role === Role.employee) {
    where.assignedToId = userId;
  } else if (query.assignedToId) {
    where.assignedToId = query.assignedToId;
  }

  if (query.projectId) {
    where.projectId = query.projectId;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.search) {
    where.title = {
      contains: query.search,
      mode: "insensitive",
    };
  }

  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.task.count({ where }),
  ]);

  return {
    items,
    total,
    page: query.page,
    limit: query.limit,
    hasMore: skip + items.length < total,
  };
};

export const updateTaskStatus = async (
  actorId: string,
  actorRole: Role,
  taskId: string,
  input: UpdateTaskStatusInput,
): Promise<Task> => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new AppError(404, "TASK_NOT_FOUND", "Task not found");
  }

  if (task.status === TaskStatus.APPROVED) {
    throw new AppError(400, "TASK_IMMUTABLE", "Approved tasks are immutable");
  }

  if (input.status === TaskStatus.SUBMITTED) {
    if (actorRole !== Role.employee || actorId !== task.assignedToId) {
      throw new AppError(
        403,
        "FORBIDDEN_SUBMIT",
        "Only the assigned employee can submit this task",
      );
    }

    if (task.status !== TaskStatus.IN_PROGRESS && task.status !== TaskStatus.DRAFT) {
      throw new AppError(
        400,
        "INVALID_STATUS_TRANSITION",
        `Cannot submit task from status ${task.status}`,
      );
    }

    return prisma.task.update({
      where: { id: task.id },
      data: { status: TaskStatus.SUBMITTED },
    });
  }

  if (input.status === TaskStatus.APPROVED || input.status === TaskStatus.REJECTED) {
    if (actorRole !== Role.admin && actorRole !== Role.manager) {
      throw new AppError(
        403,
        "FORBIDDEN_REVIEW",
        "Only manager or admin can approve or reject tasks",
      );
    }

    if (task.status !== TaskStatus.SUBMITTED) {
      throw new AppError(
        400,
        "INVALID_STATUS_TRANSITION",
        "Only submitted tasks can be reviewed",
      );
    }

    if (!input.comment || input.comment.trim().length === 0) {
      throw new AppError(
        400,
        "REVIEW_COMMENT_REQUIRED",
        "Comment is required for approve/reject actions",
      );
    }

    const reviewStatus =
      input.status === TaskStatus.APPROVED ? ApprovalStatus.approved : ApprovalStatus.rejected;

    const nextTaskStatus =
      input.status === TaskStatus.APPROVED ? TaskStatus.APPROVED : TaskStatus.IN_PROGRESS;

    const updatedTask = await prisma.$transaction(async (tx) => {
      await tx.approval.create({
        data: {
          taskId: task.id,
          approvedById: actorId,
          status: reviewStatus,
          comment: input.comment?.trim() || null,
        },
      });

      return tx.task.update({
        where: { id: task.id },
        data: { status: nextTaskStatus },
      });
    });

    return updatedTask;
  }

  if (input.status === TaskStatus.IN_PROGRESS) {
    if (actorRole !== Role.employee || actorId !== task.assignedToId) {
      throw new AppError(
        403,
        "FORBIDDEN_IN_PROGRESS",
        "Only the assigned employee can move task to in progress",
      );
    }

    if (task.status !== TaskStatus.DRAFT && task.status !== TaskStatus.IN_PROGRESS) {
      throw new AppError(
        400,
        "INVALID_STATUS_TRANSITION",
        `Cannot move task to in progress from status ${task.status}`,
      );
    }

    return prisma.task.update({
      where: { id: task.id },
      data: { status: TaskStatus.IN_PROGRESS },
    });
  }

  throw new AppError(400, "INVALID_STATUS", "Unsupported status update request");
};

export const createApprovalRecord = createApproval;
