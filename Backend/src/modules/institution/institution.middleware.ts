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
interface CustomInstitutionRequest extends Request {
  registrationSource?: InstitutionJwtPayload;
}

class InstitutionMiddleware {
  async verifyInstitutionRegistrationToken(
    req: CustomInstitutionRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // getting the barrer token from authorization header
      const authorizationHeader = req.headers.authorization;
      if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
        throw new AppError("Please enter the authrization token", 400);
      }

      const token = authorizationHeader.split(" ")[1];
      // getting the raw paylaod data
      const requestId = req.query.institution_request_id as string;
      if (!requestId || requestId === undefined) {
        throw new AppError(
          "Request Id is required for creating new Institution",
          400,
        );
      }
      const institutionRegistrationRequest =
        await institutionRepository.findInstitutionRegistrationRequest(
          requestId,
        );
      if (
        !institutionRegistrationRequest ||
        institutionRegistrationRequest === null
      ) {
        throw new AppError("No request found by this id", 400);
      }
      const { institution_email, institution_eiin_number } =
        institutionRegistrationRequest;

      const originalJwtPayload = {
        requestId,
        institutionEmail: institution_email,
        institutionEiinNumber: institution_eiin_number,
      };

      const JWT_SECRET = process.env.JWT_SECRET || "what I can say?";
      const decoded = jwt.verify(token, JWT_SECRET) as InstitutionJwtPayload;

      // chekcing if the decoded value match with the original payload
      if (
        String(decoded.requestId) !== String(originalJwtPayload.requestId) ||
        String(decoded.institutionEmail) !==
          String(originalJwtPayload.institutionEmail) ||
        String(decoded.institutionEiinNumber) !==
          String(originalJwtPayload.institutionEiinNumber)
      ) {
        throw new AppError(
          "Security alert: Token ID does not match request ID",
          403,
        );
      }

      // passing the registrationsource to the next route
      req.registrationSource = decoded;
      next();
      // now check the jwt
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }
}

export const institutionMIddleware = new InstitutionMiddleware();
