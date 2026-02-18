import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../common/ApiResponse";

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

export const responseTransformerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const startedAt = Date.now();
  const originalJson = res.json.bind(res);

  res.json = ((body: unknown) => {
    if (isObject(body) && typeof body.success === "boolean") {
      return originalJson(body);
    }

    if (res.statusCode < 400) {
      return originalJson(new ApiResponse("Success", body));
    }

    return originalJson(body);
  }) as Response["json"];

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    console.log(`response ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`);
  });

  next();
};
