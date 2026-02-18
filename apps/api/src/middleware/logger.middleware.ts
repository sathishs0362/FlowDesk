import { NextFunction, Request, Response } from "express";

export const loggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const startedAt = Date.now();
  const { method, originalUrl } = req;

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    console.log(`${method} ${originalUrl} ${res.statusCode} ${durationMs}ms`);
  });

  next();
};
