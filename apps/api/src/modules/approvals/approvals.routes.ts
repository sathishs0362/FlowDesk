import { Role } from "@prisma/client";
import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";
import { getApprovalsByTaskHandler } from "./approvals.controller";

const approvalsRoutes = Router();

approvalsRoutes.use(authMiddleware);
approvalsRoutes.get(
  "/task/:taskId",
  roleMiddleware([Role.admin, Role.manager]),
  getApprovalsByTaskHandler,
);

export { approvalsRoutes };
