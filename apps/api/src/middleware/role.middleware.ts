import { Role } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../common/AppError";

export const roleMiddleware = (allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError(403, "FORBIDDEN", "You do not have permission for this action"));
      return;
    }

    next();
  };
};
