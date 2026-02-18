"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const AppError_1 = require("../common/AppError");
const jwt_1 = require("../utils/jwt");
const authMiddleware = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        next(new AppError_1.AppError(401, "UNAUTHORIZED", "Authorization token is required"));
        return;
    }
    const token = authHeader.slice(7).trim();
    if (!token) {
        next(new AppError_1.AppError(401, "UNAUTHORIZED", "Authorization token is required"));
        return;
    }
    try {
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        req.user = decoded;
        next();
    }
    catch {
        next(new AppError_1.AppError(401, "INVALID_TOKEN", "Invalid or expired token"));
    }
};
exports.authMiddleware = authMiddleware;
