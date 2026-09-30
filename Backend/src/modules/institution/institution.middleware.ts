import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { institutionRepository } from "./institution.repository.js";
import { AppError } from "@/utils/appError.js";

interface InstitutionJwtPayload {
  requestId: string;
  institutionEmail: string;
  institutionEiinNumber: string | number;
}

// Extend the Express Request type locally for this workflow
export interface CustomInstitutionRequest extends Request {
  registrationSource?: InstitutionJwtPayload;
  auth?: unknown;
}

class InstitutionMiddleware {
  constructor() {
    this.verifyInstitutionRegistrationToken =
      this.verifyInstitutionRegistrationToken.bind(this);
    this.verifyAuthToken = this.verifyAuthToken.bind(this);
  }

  /**
   * Specialized guard for POST /institution-creation.
   * Verifies the 24-hour invitation token received by the institution and ensures
   * the token matches the approved institution registration request.
   */
  async verifyInstitutionRegistrationToken(
    req: CustomInstitutionRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const authorizationHeader = req.headers.authorization;
      if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
        throw new AppError(
          "Authorization token is required. Format: Bearer <token>",
          401,
        );
      }

      const token = authorizationHeader.split(" ")[1];
      if (!token || token.trim().length === 0) {
        throw new AppError("Invalid authorization token format", 401);
      }

      const requestId = (req.query.institution_request_id ||
        req.query.id) as string;
      if (!requestId || requestId.trim().length === 0) {
        throw new AppError(
          "Request ID is required for creating new Institution",
          400,
        );
      }

      const institutionRegistrationRequest =
        await institutionRepository.findInstitutionRegistrationRequest(
          requestId,
        );
      if (!institutionRegistrationRequest) {
        throw new AppError("No registration request found with this ID", 404);
      }

      const { institution_email, institution_eiin_number } =
        institutionRegistrationRequest;

      const originalJwtPayload = {
        requestId,
        institutionEmail: institution_email,
        institutionEiinNumber: institution_eiin_number,
      };

      const JWT_SECRET = process.env.JWT_SECRET || "what I can say?";
      let decoded: InstitutionJwtPayload;
      try {
        decoded = jwt.verify(token, JWT_SECRET) as InstitutionJwtPayload;
      } catch (jwtErr) {
        throw new AppError("Invalid or expired registration token", 401);
      }

      // Check if decoded token data matches the DB request record
      if (
        String(decoded.requestId) !== String(originalJwtPayload.requestId) ||
        String(decoded.institutionEmail) !==
          String(originalJwtPayload.institutionEmail) ||
        String(decoded.institutionEiinNumber) !==
          String(originalJwtPayload.institutionEiinNumber)
      ) {
        throw new AppError(
          "Security alert: Token payload does not match the registration request",
          403,
        );
      }

      req.registrationSource = decoded;
      next();
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(`Authentication error: ${err}`, 401);
    }
  }

  /**
   * General Bearer token authentication guard for all protected institution routes.
   * Validates Authorization: Bearer <token> header and verifies JWT signature.
   */
  async verifyAuthToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const authorizationHeader = req.headers.authorization;
      if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
        throw new AppError(
          "Authorization token is required. Format: Bearer <token>",
          401,
        );
      }

      const token = authorizationHeader.split(" ")[1];
      if (!token || token.trim().length === 0) {
        throw new AppError("Invalid authorization token format", 401);
      }

      const JWT_SECRET = process.env.JWT_SECRET || "what I can say?";
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // @ts-expect-error - attach decoded auth payload to request
        req.auth = decoded;
        next();
      } catch (jwtErr) {
        throw new AppError("Invalid or expired authorization token", 401);
      }
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(`Authentication error: ${err}`, 401);
    }
  }
}

export const institutionMIddleware = new InstitutionMiddleware();
export const institutionMiddleware = institutionMIddleware;
