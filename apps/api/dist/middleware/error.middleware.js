"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = require("jsonwebtoken");
const zod_1 = require("zod");
const AppError_1 = require("../common/AppError");
const buildErrorResponse = (message, code, details) => ({
    success: false,
    message,
    error: {
        code,
        details,
    },
});
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof AppError_1.AppError) {
        const payload = buildErrorResponse(err.message, err.errorCode, err.details);
        res.status(err.statusCode).json(payload);
        return;
    }
    if (err instanceof zod_1.ZodError) {
        const payload = buildErrorResponse("Validation failed", "VALIDATION_ERROR", err.flatten().fieldErrors);
        res.status(400).json(payload);
        return;
    }
    if (err instanceof jsonwebtoken_1.TokenExpiredError) {
        const payload = buildErrorResponse("Token expired", "TOKEN_EXPIRED");
        res.status(401).json(payload);
        return;
    }
    if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
        const payload = buildErrorResponse("Invalid token", "INVALID_TOKEN");
        res.status(401).json(payload);
        return;
    }
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            const payload = buildErrorResponse("Unique constraint violation", "DUPLICATE_RESOURCE");
            res.status(409).json(payload);
            return;
        }
        if (err.code === "P2025") {
            const payload = buildErrorResponse("Resource not found", "RESOURCE_NOT_FOUND");
            res.status(404).json(payload);
            return;
        }
        const payload = buildErrorResponse("Database error", "DATABASE_ERROR", {
            prismaCode: err.code,
            meta: err.meta,
        });
        res.status(500).json(payload);
        return;
    }
    if (err instanceof client_1.Prisma.PrismaClientValidationError) {
        const payload = buildErrorResponse("Database validation error", "DATABASE_VALIDATION_ERROR");
        res.status(400).json(payload);
        return;
    }
    console.error(err);
    const payload = buildErrorResponse("Internal server error", "INTERNAL_SERVER_ERROR");
    res.status(500).json(payload);
};
exports.errorHandler = errorHandler;
