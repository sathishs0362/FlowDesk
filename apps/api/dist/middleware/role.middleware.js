"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = void 0;
const AppError_1 = require("../common/AppError");
const roleMiddleware = (allowedRoles) => {
    return (req, _res, next) => {
        if (!req.user) {
            next(new AppError_1.AppError(401, "UNAUTHORIZED", "Authentication required"));
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            next(new AppError_1.AppError(403, "FORBIDDEN", "You do not have permission for this action"));
            return;
        }
        next();
    };
};
exports.roleMiddleware = roleMiddleware;
