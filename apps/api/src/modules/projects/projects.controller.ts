import { Request, Response } from "express";
import { z } from "zod";
import { ApiResponse } from "../../common/ApiResponse";
import { AppError } from "../../common/AppError";
import { asyncHandler } from "../../common/asyncHandler";
import { createProject, getProjectById, getProjects } from "./projects.service";

const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(1000).optional(),
});

const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const createProjectHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }

  const payload = createProjectSchema.parse(req.body);
  const project = await createProject(req.user.id, payload);

  return res.status(201).json(new ApiResponse("Project created successfully", project));
});

export const getProjectsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const projects = await getProjects();
  const meta = { total: projects.length };

  return res.status(200).json(new ApiResponse("Projects fetched successfully", projects, meta));
});

export const getProjectByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const params = idParamSchema.parse(req.params);
  const project = await getProjectById(params.id);

  return res.status(200).json(new ApiResponse("Project fetched successfully", project));
});
