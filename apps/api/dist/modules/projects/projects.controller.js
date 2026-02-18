"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectByIdHandler = exports.getProjectsHandler = exports.createProjectHandler = void 0;
const zod_1 = require("zod");
const ApiResponse_1 = require("../../common/ApiResponse");
const AppError_1 = require("../../common/AppError");
const asyncHandler_1 = require("../../common/asyncHandler");
const projects_service_1 = require("./projects.service");
const createProjectSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2).max(150),
    description: zod_1.z.string().trim().max(1000).optional(),
});
const idParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
exports.createProjectHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new AppError_1.AppError(401, "UNAUTHORIZED", "Authentication required");
    }
    const payload = createProjectSchema.parse(req.body);
    const project = await (0, projects_service_1.createProject)(req.user.id, payload);
    return res.status(201).json(new ApiResponse_1.ApiResponse("Project created successfully", project));
});
exports.getProjectsHandler = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const projects = await (0, projects_service_1.getProjects)();
    const meta = { total: projects.length };
    return res.status(200).json(new ApiResponse_1.ApiResponse("Projects fetched successfully", projects, meta));
});
exports.getProjectByIdHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const params = idParamSchema.parse(req.params);
    const project = await (0, projects_service_1.getProjectById)(params.id);
    return res.status(200).json(new ApiResponse_1.ApiResponse("Project fetched successfully", project));
});
