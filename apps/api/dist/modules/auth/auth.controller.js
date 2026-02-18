"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const ApiResponse_1 = require("../../common/ApiResponse");
const asyncHandler_1 = require("../../common/asyncHandler");
const auth_service_1 = require("./auth.service");
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2).max(100),
    email: zod_1.z.string().trim().email(),
    password: zod_1.z.string().min(8).max(100),
    role: zod_1.z.nativeEnum(client_1.Role).optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email(),
    password: zod_1.z.string().min(1),
});
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const payload = registerSchema.parse(req.body);
    const data = await (0, auth_service_1.registerUser)(payload);
    return res.status(201).json(new ApiResponse_1.ApiResponse("User registered successfully", data));
});
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const payload = loginSchema.parse(req.body);
    const data = await (0, auth_service_1.loginUser)(payload);
    return res.status(200).json(new ApiResponse_1.ApiResponse("Login successful", data));
});
