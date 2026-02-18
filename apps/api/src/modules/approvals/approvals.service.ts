import { Approval } from "@prisma/client";
import { prisma } from "../../config/db";
import { CreateApprovalInput } from "./approvals.types";

export const createApproval = async (input: CreateApprovalInput): Promise<Approval> => {
  return prisma.approval.create({
    data: {
      taskId: input.taskId,
      approvedById: input.approvedById,
      status: input.status,
      comment: input.comment,
    },
  });
};

export const getApprovalsByTaskId = async (taskId: string): Promise<Approval[]> => {
  return prisma.approval.findMany({
    where: { taskId },
    orderBy: { createdAt: "desc" },
  });
};
