"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const env_1 = require("./env");
const globalScope = globalThis;
exports.prisma = globalScope.prisma ??
    new client_1.PrismaClient({
        log: env_1.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
    });
if (env_1.env.NODE_ENV !== "production") {
    globalScope.prisma = exports.prisma;
}
const connectDB = async () => {
    await exports.prisma.$connect();
    console.log("Database connected");
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    await exports.prisma.$disconnect();
};
exports.disconnectDB = disconnectDB;
