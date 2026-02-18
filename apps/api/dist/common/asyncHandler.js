"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
const asyncHandler = (handler) => {
    return (req, res, next) => {
        try {
            const result = handler(req, res, next);
            Promise.resolve(result).catch(next);
        }
        catch (error) {
            next(error);
        }
    };
};
exports.asyncHandler = asyncHandler;
