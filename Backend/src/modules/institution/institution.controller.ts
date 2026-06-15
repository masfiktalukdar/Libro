import { Request, Response, NextFunction } from "express";
import { institutionServices } from "@modules/institution/institution.services.js";

export class InstitutionController {
  async institutionRequestRegister(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const institutionRequestResult =
        await institutionServices.createInstitutionRegistrationRequest(
          req.body,
        );
      res.status(201).json({
        success: true,
        message:
          "Institution registration request has been created successfully",
        data: institutionRequestResult,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const institutionController = new InstitutionController();
