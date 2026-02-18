import { Prisma } from "@prisma/client";
import { ErrorRequestHandler } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ZodError } from "zod";
import { AppError } from "../common/AppError";

interface StandardErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    details?: unknown;
  };
}

const buildErrorResponse = (
  message: string,
  code: string,
  details?: unknown,
): StandardErrorResponse => ({
  success: false,
  message,
  error: {
    code,
    details,
  },
});

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    const payload = buildErrorResponse(err.message, err.errorCode, err.details);
    res.status(err.statusCode).json(payload);
    return;
  }

  if (err instanceof ZodError) {
    const payload = buildErrorResponse(
      "Validation failed",
      "VALIDATION_ERROR",
      err.flatten().fieldErrors,
    );
    res.status(400).json(payload);
    return;
  }

  if (err instanceof TokenExpiredError) {
    const payload = buildErrorResponse("Token expired", "TOKEN_EXPIRED");
    res.status(401).json(payload);
    return;
  }

  if (err instanceof JsonWebTokenError) {
    const payload = buildErrorResponse("Invalid token", "INVALID_TOKEN");
    res.status(401).json(payload);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
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

  if (err instanceof Prisma.PrismaClientValidationError) {
    const payload = buildErrorResponse("Database validation error", "DATABASE_VALIDATION_ERROR");
    res.status(400).json(payload);
    return;
  }

  console.error(err);
  const payload = buildErrorResponse("Internal server error", "INTERNAL_SERVER_ERROR");
  res.status(500).json(payload);
};
