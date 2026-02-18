"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const client_1 = require("@prisma/client");
const db_1 = require("../../config/db");
const AppError_1 = require("../../common/AppError");
const hash_1 = require("../../utils/hash");
const jwt_1 = require("../../utils/jwt");
const toPublicUser = (user) => {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
    };
};
const toAuthPayload = (user) => {
    return {
        user: toPublicUser(user),
        accessToken: (0, jwt_1.generateAccessToken)({
            id: user.id,
            email: user.email,
            role: user.role,
        }),
    };
};
const registerUser = async (input) => {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existingUser = await db_1.prisma.user.findUnique({
        where: { email: normalizedEmail },
    });
    if (existingUser) {
        throw new AppError_1.AppError(409, "EMAIL_ALREADY_EXISTS", "Email already exists");
    }
    const hashedPassword = await (0, hash_1.hashPassword)(input.password);
    const user = await db_1.prisma.user.create({
        data: {
            name: input.name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: input.role ?? client_1.Role.employee,
        },
    });
    return toAuthPayload(user);
};
exports.registerUser = registerUser;
const loginUser = async (input) => {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await db_1.prisma.user.findUnique({
        where: { email: normalizedEmail },
    });
    if (!user) {
        throw new AppError_1.AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }
    const passwordMatches = await (0, hash_1.comparePassword)(input.password, user.password);
    if (!passwordMatches) {
        throw new AppError_1.AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }
    return toAuthPayload(user);
};
exports.loginUser = loginUser;
