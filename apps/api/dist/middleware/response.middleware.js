"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseTransformerMiddleware = void 0;
const ApiResponse_1 = require("../common/ApiResponse");
const isObject = (value) => {
    return typeof value === "object" && value !== null;
};
const responseTransformerMiddleware = (req, res, next) => {
    const startedAt = Date.now();
    const originalJson = res.json.bind(res);
    res.json = ((body) => {
        if (isObject(body) && typeof body.success === "boolean") {
            return originalJson(body);
        }
        if (res.statusCode < 400) {
            return originalJson(new ApiResponse_1.ApiResponse("Success", body));
        }
        return originalJson(body);
    });
    res.on("finish", () => {
        const durationMs = Date.now() - startedAt;
        console.log(`response ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`);
    });
    next();
};
exports.responseTransformerMiddleware = responseTransformerMiddleware;
