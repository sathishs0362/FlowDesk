"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerMiddleware = void 0;
const loggerMiddleware = (req, res, next) => {
    const startedAt = Date.now();
    const { method, originalUrl } = req;
    res.on("finish", () => {
        const durationMs = Date.now() - startedAt;
        console.log(`${method} ${originalUrl} ${res.statusCode} ${durationMs}ms`);
    });
    next();
};
exports.loggerMiddleware = loggerMiddleware;
