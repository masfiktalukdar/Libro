import { Request, Response, NextFunction } from "express";
import { institutionServices } from "@modules/institution/institution.services.js";
import { AppError } from "@/utils/appError.js";

export class InstitutionController {
  // Controller for institution request registration
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

  // Controller for changing registration status
  async institutionRequestEdit(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const institutionRequestId = req.get("institution_request_id") ?? "";
      const statusPayload = req.get("registration_request_status") ?? "";

      if (institutionRequestId === "" || null || statusPayload === "" || null) {
        throw new AppError(
          "Please provide institutionRequestId and statusPayload properly",
          400,
        );
      }

      const institutionRequestEditResult =
        await institutionServices.editRegistrationRequest(
          institutionRequestId,
          statusPayload,
        );

      res.status(201).json({
        success: true,
        message: `Institution registration request changed to ${statusPayload} successfully`,
        data: institutionRequestEditResult,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const institutionController = new InstitutionController();
