import { Request, Response, NextFunction } from "express";
import { RowDataPacket } from "mysql2";
import { dbPool } from "@/config/dbConnect.js";
import { AppError } from "@/utils/appError.js";

export const verifyOTPMiddleware = (emailField: string) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const email = req.body[emailField];
    const { otp } = req.body;

    if (!email) {
      throw new AppError("Please provide email", 400);
    }
    if (!otp) {
      throw new AppError("Please provide otp", 400);
    }

    const [rows] = await dbPool.execute<RowDataPacket[]>(
      `
    SELECT *
    FROM user_otps
    WHERE email = ?
      AND otp = ?
      AND expires_at > NOW()
    `,
      [email, otp],
    );

    if (!rows || !rows.length) {
      throw new AppError("Your given OTP is incorrect or expired", 400);
    }

    next();
  };
};
