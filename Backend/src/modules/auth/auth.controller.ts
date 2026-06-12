import { Request, Response, NextFunction } from "express";
import { authService } from "@modules/auth/auth.services.js";

export class AuthController {
  async regester(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const registrationResult = await authService.registerInstitutionalUser(
        req.body,
      );
      res.status(201).json({
        success: true,
        message: "Institutional account successfully provisioned.",
        data: registrationResult,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
