"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const generateAccessToken = (payload) => {
    const options = {
        expiresIn: env_1.env.JWT_EXPIRES_IN,
    };
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, options);
};
exports.generateAccessToken = generateAccessToken;
const verifyAccessToken = (token) => {
    const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
    if (typeof decoded === "string") {
        throw new Error("Invalid token payload");
    }
    const tokenUser = decoded;
    if (!tokenUser.id || !tokenUser.email || !tokenUser.role) {
        throw new Error("Token payload missing required fields");
    }
    return {
        id: tokenUser.id,
        email: tokenUser.email,
        role: tokenUser.role,
    };
};
exports.verifyAccessToken = verifyAccessToken;
