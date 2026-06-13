import { Request, Response, NextFunction } from "express";
import { AppError } from "@utils/appError.js";

export const globalErrorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    statusCode: statusCode,
    message: err.message,
  });
};
