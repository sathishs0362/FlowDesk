import { Role } from "@prisma/client";
import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";
import {
  createProjectHandler,
  getProjectByIdHandler,
  getProjectsHandler,
} from "./projects.controller";

const projectsRoutes = Router();

projectsRoutes.use(authMiddleware);

projectsRoutes.post(
  "/",
  roleMiddleware([Role.admin, Role.manager]),
  createProjectHandler,
);
projectsRoutes.get("/", getProjectsHandler);
projectsRoutes.get("/:id", getProjectByIdHandler);

export { projectsRoutes };
