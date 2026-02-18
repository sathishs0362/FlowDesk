import { Role } from "@prisma/client";
import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";
import {
  createTaskHandler,
  getTasksHandler,
  updateTaskStatusHandler,
} from "./tasks.controller";

const tasksRoutes = Router();

tasksRoutes.use(authMiddleware);

tasksRoutes.post("/", roleMiddleware([Role.admin, Role.manager]), createTaskHandler);
tasksRoutes.get("/", getTasksHandler);
tasksRoutes.patch("/:id/status", updateTaskStatusHandler);

export { tasksRoutes };
