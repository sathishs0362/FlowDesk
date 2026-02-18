import { Request, Response } from "express";
import { z } from "zod";
import { ApiResponse } from "../../common/ApiResponse";
import { asyncHandler } from "../../common/asyncHandler";
import { getApprovalsByTaskId } from "./approvals.service";

const taskParamSchema = z.object({
  taskId: z.string().uuid(),
});

export const getApprovalsByTaskHandler = asyncHandler(async (
  req: Request,
  res: Response,
) => {
  const params = taskParamSchema.parse(req.params);
  const approvals = await getApprovalsByTaskId(params.taskId);

  return res
    .status(200)
    .json(new ApiResponse("Approvals fetched successfully", approvals, { total: approvals.length }));
});
