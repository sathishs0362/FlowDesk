import { Project } from "@prisma/client";
import { prisma } from "../../config/db";
import { AppError } from "../../common/AppError";
import { CreateProjectInput } from "./projects.types";

export const createProject = async (
  createdById: string,
  input: CreateProjectInput,
): Promise<Project> => {
  return prisma.project.create({
    data: {
      name: input.name.trim(),
      description: input.description?.trim() || null,
      createdById,
    },
  });
};

export const getProjects = async (): Promise<Project[]> => {
  return prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const getProjectById = async (id: string): Promise<Project> => {
  const project = await prisma.project.findUnique({ where: { id } });

  if (!project) {
    throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
  }

  return project;
};
