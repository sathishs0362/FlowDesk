"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApprovalRecord = exports.updateTaskStatus = exports.getTasks = exports.createTask = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = require("../../common/AppError");
const db_1 = require("../../config/db");
const approvals_service_1 = require("../approvals/approvals.service");
const createTask = async (creatorId, input) => {
    const [project, assignee] = await Promise.all([
        db_1.prisma.project.findUnique({ where: { id: input.projectId } }),
        db_1.prisma.user.findUnique({ where: { id: input.assignedToId } }),
    ]);
    if (!project) {
        throw new AppError_1.AppError(404, "PROJECT_NOT_FOUND", "Project not found");
    }
    if (!assignee) {
        throw new AppError_1.AppError(404, "ASSIGNEE_NOT_FOUND", "Assigned user not found");
    }
    if (assignee.role !== client_1.Role.employee) {
        throw new AppError_1.AppError(400, "INVALID_ASSIGNEE", "Tasks can only be assigned to employees");
    }
    return db_1.prisma.task.create({
        data: {
            title: input.title.trim(),
            description: input.description?.trim() || null,
            projectId: input.projectId,
            assignedToId: input.assignedToId,
            createdById: creatorId,
            status: client_1.TaskStatus.DRAFT,
        },
    });
};
exports.createTask = createTask;
const getTasks = async (userId, role, query) => {
    const where = {};
    if (role === client_1.Role.employee) {
        where.assignedToId = userId;
    }
    else if (query.assignedToId) {
        where.assignedToId = query.assignedToId;
    }
    if (query.projectId) {
        where.projectId = query.projectId;
    }
    if (query.status) {
        where.status = query.status;
    }
    if (query.search) {
        where.title = {
            contains: query.search,
            mode: "insensitive",
        };
    }
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
        db_1.prisma.task.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: query.limit,
        }),
        db_1.prisma.task.count({ where }),
    ]);
    return {
        items,
        total,
        page: query.page,
        limit: query.limit,
        hasMore: skip + items.length < total,
    };
};
exports.getTasks = getTasks;
const updateTaskStatus = async (actorId, actorRole, taskId, input) => {
    const task = await db_1.prisma.task.findUnique({
        where: { id: taskId },
    });
    if (!task) {
        throw new AppError_1.AppError(404, "TASK_NOT_FOUND", "Task not found");
    }
    if (task.status === client_1.TaskStatus.APPROVED) {
        throw new AppError_1.AppError(400, "TASK_IMMUTABLE", "Approved tasks are immutable");
    }
    if (input.status === client_1.TaskStatus.SUBMITTED) {
        if (actorRole !== client_1.Role.employee || actorId !== task.assignedToId) {
            throw new AppError_1.AppError(403, "FORBIDDEN_SUBMIT", "Only the assigned employee can submit this task");
        }
        if (task.status !== client_1.TaskStatus.IN_PROGRESS && task.status !== client_1.TaskStatus.DRAFT) {
            throw new AppError_1.AppError(400, "INVALID_STATUS_TRANSITION", `Cannot submit task from status ${task.status}`);
        }
        return db_1.prisma.task.update({
            where: { id: task.id },
            data: { status: client_1.TaskStatus.SUBMITTED },
        });
    }
    if (input.status === client_1.TaskStatus.APPROVED || input.status === client_1.TaskStatus.REJECTED) {
        if (actorRole !== client_1.Role.admin && actorRole !== client_1.Role.manager) {
            throw new AppError_1.AppError(403, "FORBIDDEN_REVIEW", "Only manager or admin can approve or reject tasks");
        }
        if (task.status !== client_1.TaskStatus.SUBMITTED) {
            throw new AppError_1.AppError(400, "INVALID_STATUS_TRANSITION", "Only submitted tasks can be reviewed");
        }
        if (!input.comment || input.comment.trim().length === 0) {
            throw new AppError_1.AppError(400, "REVIEW_COMMENT_REQUIRED", "Comment is required for approve/reject actions");
        }
        const reviewStatus = input.status === client_1.TaskStatus.APPROVED ? client_1.ApprovalStatus.approved : client_1.ApprovalStatus.rejected;
        const nextTaskStatus = input.status === client_1.TaskStatus.APPROVED ? client_1.TaskStatus.APPROVED : client_1.TaskStatus.IN_PROGRESS;
        const updatedTask = await db_1.prisma.$transaction(async (tx) => {
            await tx.approval.create({
                data: {
                    taskId: task.id,
                    approvedById: actorId,
                    status: reviewStatus,
                    comment: input.comment?.trim() || null,
                },
            });
            return tx.task.update({
                where: { id: task.id },
                data: { status: nextTaskStatus },
            });
        });
        return updatedTask;
    }
    if (input.status === client_1.TaskStatus.IN_PROGRESS) {
        if (actorRole !== client_1.Role.employee || actorId !== task.assignedToId) {
            throw new AppError_1.AppError(403, "FORBIDDEN_IN_PROGRESS", "Only the assigned employee can move task to in progress");
        }
        if (task.status !== client_1.TaskStatus.DRAFT && task.status !== client_1.TaskStatus.IN_PROGRESS) {
            throw new AppError_1.AppError(400, "INVALID_STATUS_TRANSITION", `Cannot move task to in progress from status ${task.status}`);
        }
        return db_1.prisma.task.update({
            where: { id: task.id },
            data: { status: client_1.TaskStatus.IN_PROGRESS },
        });
    }
    throw new AppError_1.AppError(400, "INVALID_STATUS", "Unsupported status update request");
};
exports.updateTaskStatus = updateTaskStatus;
exports.createApprovalRecord = approvals_service_1.createApproval;
