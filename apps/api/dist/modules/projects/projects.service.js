"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectById = exports.getProjects = exports.createProject = void 0;
const db_1 = require("../../config/db");
const AppError_1 = require("../../common/AppError");
const createProject = async (createdById, input) => {
    return db_1.prisma.project.create({
        data: {
            name: input.name.trim(),
            description: input.description?.trim() || null,
            createdById,
        },
    });
};
exports.createProject = createProject;
const getProjects = async () => {
    return db_1.prisma.project.findMany({
        orderBy: { createdAt: "desc" },
    });
};
exports.getProjects = getProjects;
const getProjectById = async (id) => {
    const project = await db_1.prisma.project.findUnique({ where: { id } });
    if (!project) {
        throw new AppError_1.AppError(404, "PROJECT_NOT_FOUND", "Project not found");
    }
    return project;
};
exports.getProjectById = getProjectById;
