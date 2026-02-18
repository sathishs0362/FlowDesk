import { TaskStatus } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
import { ApiResponse } from "../../common/ApiResponse";
import { AppError } from "../../common/AppError";
import { asyncHandler } from "../../common/asyncHandler";
import { createTask, getTasks, updateTaskStatus } from "./tasks.service";

const createTaskSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional(),
  projectId: z.string().uuid(),
  assignedToId: z.string().uuid(),
});

const taskIdSchema = z.object({
  id: z.string().uuid(),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
  comment: z.string().trim().max(1000).optional(),
});

const getTasksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  projectId: z.string().uuid().optional(),
  assignedToId: z.string().uuid().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  search: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
});

export const createTaskHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }

  const payload = createTaskSchema.parse(req.body);
  const task = await createTask(req.user.id, payload);

  return res.status(201).json(new ApiResponse("Task created successfully", task));
});

export const getTasksHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }

  const query = getTasksQuerySchema.parse(req.query);
  const result = await getTasks(req.user.id, req.user.role, query);

  return res
    .status(200)
    .json(
      new ApiResponse("Tasks fetched successfully", result.items, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        hasMore: result.hasMore,
      }),
    );
});

export const updateTaskStatusHandler = asyncHandler(async (
  req: Request,
  res: Response,
) => {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }

  const params = taskIdSchema.parse(req.params);
  const payload = updateStatusSchema.parse(req.body);

  const task = await updateTaskStatus(req.user.id, req.user.role, params.id, payload);

  return res.status(200).json(new ApiResponse("Task status updated successfully", task));
});
