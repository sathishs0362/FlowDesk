"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const ApiResponse_1 = require("./common/ApiResponse");
const AppError_1 = require("./common/AppError");
const error_middleware_1 = require("./middleware/error.middleware");
const logger_middleware_1 = require("./middleware/logger.middleware");
const response_middleware_1 = require("./middleware/response.middleware");
const approvals_routes_1 = require("./modules/approvals/approvals.routes");
const auth_routes_1 = require("./modules/auth/auth.routes");
const projects_routes_1 = require("./modules/projects/projects.routes");
const tasks_routes_1 = require("./modules/tasks/tasks.routes");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(logger_middleware_1.loggerMiddleware);
app.use(response_middleware_1.responseTransformerMiddleware);
app.get("/health", (_req, res) => {
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse("Service is healthy", { status: "OK" }));
});
app.use("/api/auth", auth_routes_1.authRoutes);
app.use("/api/projects", projects_routes_1.projectsRoutes);
app.use("/api/tasks", tasks_routes_1.tasksRoutes);
app.use("/api/approvals", approvals_routes_1.approvalsRoutes);
app.use((_req, _res, next) => {
    next(new AppError_1.AppError(404, "ROUTE_NOT_FOUND", "Route not found"));
});
app.use(error_middleware_1.errorHandler);
exports.default = app;
