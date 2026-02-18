"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApprovalsByTaskHandler = void 0;
const zod_1 = require("zod");
const ApiResponse_1 = require("../../common/ApiResponse");
const asyncHandler_1 = require("../../common/asyncHandler");
const approvals_service_1 = require("./approvals.service");
const taskParamSchema = zod_1.z.object({
    taskId: zod_1.z.string().uuid(),
});
exports.getApprovalsByTaskHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const params = taskParamSchema.parse(req.params);
    const approvals = await (0, approvals_service_1.getApprovalsByTaskId)(params.taskId);
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse("Approvals fetched successfully", approvals, { total: approvals.length }));
});
