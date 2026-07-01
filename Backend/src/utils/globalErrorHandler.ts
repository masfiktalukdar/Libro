import { Request, Response, NextFunction } from "express";
import { AppError } from "@utils/appError.js";
import { ZodError } from "zod"; // 1. Import ZodError

export const globalErrorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  // Intercept ZodErrors thrown inside controllers
  if (err instanceof ZodError) {
    return res.status(400).json(
      err.issues.map((issue) => ({
        success: false,
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  // Fallback for AppErrors and unexpected errors
  const statusCode = err instanceof AppError ? err.statusCode : 500;

  return res.status(statusCode).json({
    success: false,
    statusCode: statusCode,
    message: err.message,
  });
};
