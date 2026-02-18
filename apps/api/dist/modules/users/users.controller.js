"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByIdHandler = exports.getUsersHandler = void 0;
const zod_1 = require("zod");
const ApiResponse_1 = require("../../common/ApiResponse");
const asyncHandler_1 = require("../../common/asyncHandler");
const users_service_1 = require("./users.service");
const userIdSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
exports.getUsersHandler = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const users = await (0, users_service_1.getUsers)();
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse("Users fetched successfully", users, { total: users.length }));
});
exports.getUserByIdHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const params = userIdSchema.parse(req.params);
    const user = await (0, users_service_1.getUserById)(params.id);
    return res.status(200).json(new ApiResponse_1.ApiResponse("User fetched successfully", user));
});
