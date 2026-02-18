import cors from "cors";
import express from "express";
import { ApiResponse } from "./common/ApiResponse";
import { AppError } from "./common/AppError";
import { errorHandler } from "./middleware/error.middleware";
import { loggerMiddleware } from "./middleware/logger.middleware";
import { responseTransformerMiddleware } from "./middleware/response.middleware";
import { approvalsRoutes } from "./modules/approvals/approvals.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { projectsRoutes } from "./modules/projects/projects.routes";
import { tasksRoutes } from "./modules/tasks/tasks.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);
app.use(responseTransformerMiddleware);

app.get("/health", (_req, res) => {
  return res
    .status(200)
    .json(new ApiResponse("Service is healthy", { status: "OK" }));
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/approvals", approvalsRoutes);

app.use((_req, _res, next) => {
  next(new AppError(404, "ROUTE_NOT_FOUND", "Route not found"));
});

app.use(errorHandler);

export default app;
