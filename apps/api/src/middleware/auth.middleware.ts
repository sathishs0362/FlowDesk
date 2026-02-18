import { NextFunction, Request, Response } from "express";
import { AppError } from "../common/AppError";
import { verifyAccessToken } from "../utils/jwt";

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(new AppError(401, "UNAUTHORIZED", "Authorization token is required"));
    return;
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    next(new AppError(401, "UNAUTHORIZED", "Authorization token is required"));
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch {
    next(new AppError(401, "INVALID_TOKEN", "Invalid or expired token"));
  }
};
