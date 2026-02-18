"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskStatusHandler = exports.getTasksHandler = exports.createTaskHandler = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const ApiResponse_1 = require("../../common/ApiResponse");
const AppError_1 = require("../../common/AppError");
const asyncHandler_1 = require("../../common/asyncHandler");
const tasks_service_1 = require("./tasks.service");
const createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(2).max(200),
    description: zod_1.z.string().trim().max(2000).optional(),
    projectId: zod_1.z.string().uuid(),
    assignedToId: zod_1.z.string().uuid(),
});
const taskIdSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
const updateStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.TaskStatus),
    comment: zod_1.z.string().trim().max(1000).optional(),
});
exports.createTaskHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new AppError_1.AppError(401, "UNAUTHORIZED", "Authentication required");
    }
    const payload = createTaskSchema.parse(req.body);
    const task = await (0, tasks_service_1.createTask)(req.user.id, payload);
    return res.status(201).json(new ApiResponse_1.ApiResponse("Task created successfully", task));
});
exports.getTasksHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new AppError_1.AppError(401, "UNAUTHORIZED", "Authentication required");
    }
    const tasks = await (0, tasks_service_1.getTasks)(req.user.id, req.user.role);
    return res.status(200).json(new ApiResponse_1.ApiResponse("Tasks fetched successfully", tasks, { total: tasks.length }));
});
exports.updateTaskStatusHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new AppError_1.AppError(401, "UNAUTHORIZED", "Authentication required");
    }
    const params = taskIdSchema.parse(req.params);
    const payload = updateStatusSchema.parse(req.body);
    const task = await (0, tasks_service_1.updateTaskStatus)(req.user.id, req.user.role, params.id, payload);
    return res.status(200).json(new ApiResponse_1.ApiResponse("Task status updated successfully", task));
});
