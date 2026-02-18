import { ApprovalStatus } from "@prisma/client";

export interface CreateApprovalInput {
  taskId: string;
  approvedById: string;
  status: ApprovalStatus;
  comment: string;
}
