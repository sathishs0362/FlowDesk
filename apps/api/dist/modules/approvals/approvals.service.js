"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApprovalsByTaskId = exports.createApproval = void 0;
const db_1 = require("../../config/db");
const createApproval = async (input) => {
    return db_1.prisma.approval.create({
        data: {
            taskId: input.taskId,
            approvedById: input.approvedById,
            status: input.status,
            comment: input.comment,
        },
    });
};
exports.createApproval = createApproval;
const getApprovalsByTaskId = async (taskId) => {
    return db_1.prisma.approval.findMany({
        where: { taskId },
        orderBy: { createdAt: "desc" },
    });
};
exports.getApprovalsByTaskId = getApprovalsByTaskId;
