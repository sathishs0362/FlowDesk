"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.getUsers = void 0;
const AppError_1 = require("../../common/AppError");
const db_1 = require("../../config/db");
const publicUserSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    createdAt: true,
};
const toPublicUser = (user) => {
    return user;
};
const getUsers = async () => {
    const users = await db_1.prisma.user.findMany({
        select: publicUserSelect,
        orderBy: { createdAt: "desc" },
    });
    return users.map(toPublicUser);
};
exports.getUsers = getUsers;
const getUserById = async (id) => {
    const user = await db_1.prisma.user.findUnique({
        where: { id },
        select: publicUserSelect,
    });
    if (!user) {
        throw new AppError_1.AppError(404, "USER_NOT_FOUND", "User not found");
    }
    return toPublicUser(user);
};
exports.getUserById = getUserById;
