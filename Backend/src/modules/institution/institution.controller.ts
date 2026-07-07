import { Request, Response, NextFunction } from "express";
import { institutionServices } from "@modules/institution/institution.services.js";
import { editInstitutionService } from "@modules/institution/editInstitution.services.js";
import { institutionRepository } from "./institution.repository.js";
import {
  fileAssetSchema,
  institutionDepartmentSchema,
  institutionShiftSchema,
} from "./institution.validator.js";
import {
  OTP_PURPOSE,
  OTP_SUBJECTS,
  otpService,
} from "@/services/otpService.js";
import { userSignUpOTPTemplate } from "@/templates/userSignUpOTP.js";
import { AppError } from "@/utils/appError.js";

export class InstitutionController {
  // Controller for sent institution request registration OTP
  async sentOTPForInstitutionRegistrationRequest(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      // Sending the otp
      const { institution_email } = req.body;
      await otpService.sendOTP(
        institution_email,
        OTP_SUBJECTS.registration_request,
        OTP_PURPOSE.registration_request,
        userSignUpOTPTemplate,
      );

      // sending the success response
      res.status(201).json({
        success: true,
        message: `OTP has been sent to ${institution_email}. Please check your inbox`,
      });
    } catch (err) {
      next(err);
    }
  }

  // Controller for verify institution request registration OTP
  async institutionRequestRegister(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Creating the registration request
      const institutionRequestResult =
        await institutionServices.createInstitutionRegistrationRequest(
          req.body,
        );

      // sending the success response
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
      const institutionRequestId = req.query.institution_request_id as string;
      const statusPayload = req.query.registration_request_status as string;

      if (
        institutionRequestId === "" ||
        institutionRequestId === undefined ||
        statusPayload === "" ||
        statusPayload === undefined
      ) {
        throw new AppError(
          "Please provide institutionRequestId and statusPayload properly",
          400,
        );
      }

      const institutionRegistrationRequest =
        await institutionRepository.findInstitutionRegistrationRequest(
          institutionRequestId,
        );

      if (
        !institutionRegistrationRequest ||
        institutionRegistrationRequest === null
      ) {
        throw new AppError("No request found by this id", 400);
      }

      await institutionServices.editRegistrationRequest(
        institutionRequestId,
        statusPayload,
      );

      res.status(201).json({
        success: true,
        message: `Institution registration request changed to ${statusPayload} successfully`,
      });
    } catch (err) {
      next(err);
    }
  }

  // Controller for sending institution registration link
  async institutionCreationInvitation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const requestId = req.query.institution_request_id as string;
      if (requestId === undefined || requestId === "") {
        throw new AppError("Please enter your requestId properly", 400);
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

      const { registration_request_status } = institutionRegistrationRequest;
      if (registration_request_status !== "approved") {
        throw new AppError(
          "This institution creation request is not approved",
          400,
        );
      }

      const institutionCreationLink =
        await institutionServices.sendInstitutionCreationInvitation(requestId);

      res.status(201).json({
        sucess: true,
        message:
          "Institution creation invitation link is sent. This link will be expired in 24 hours",
        data: institutionCreationLink,
      });
    } catch (err) {
      next(err);
    }
  }

  // Controller for creation new institution
  async newInstitutionCreation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const requestId = req.query.institution_request_id as string;
      const institutionResult = await institutionServices.createNewInstitution(
        requestId,
        req.body,
      );

      res.status(201).json({
        success: true,
        message:
          "Institution registration request has been created successfully",
        data: institutionResult,
      });
    } catch (err) {
      next(err);
    }
  }

  // Controller for editing institution name
  async editInstitutionName(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await editInstitutionService.editInstitutionName(req.body);

      res.status(200).json({
        success: true,
        message: "Institution name has been changed successfully",
      });
    } catch (err) {
      next(err);
    }
  }

  // Controller for updating general data of an instiution
  async updateInstitutionGeneralData(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const institutionId = req.query.institution_id as string;
      const updatedResult =
        await editInstitutionService.editInstitutionGeneralFields(
          institutionId,
          req.body,
        );

      res.status(200).json(updatedResult);
    } catch (err) {
      next(err);
    }
  }

  // Controller for updating sensetive data of an instiution
  async updateInstitutionSensetiveData(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const institutionId = req.query.institution_id as string;
      const updatedResult =
        await editInstitutionService.editInstitutionSensetiveFields(
          institutionId,
          req.body,
        );
      res.status(200).json(updatedResult);
    } catch (err) {
      next(err);
    }
  }

  // Controller for creating department for institution
  async createInstitutionDepartment(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await editInstitutionService.createInstitutionDepartment(
        req.body,
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  // Controller for delete department
  async deleteInstitutionDepartment(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { department_id, institution_id } =
        await institutionDepartmentSchema
          .pick({ department_id: true, institution_id: true })
          .parseAsync(req.query);

      const result = await editInstitutionService.deleteInstitutionDepartment(
        department_id,
        institution_id,
      );

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  // Controller for creating new shift

  async createInstitutionShift(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await editInstitutionService.createInstitutionShift(
        req.body,
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  // Controller for updating institution shift

  async updateInstitutionShift(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { institution_id, shift_id } = await institutionShiftSchema
        .pick({
          shift_id: true,
          institution_id: true,
        })
        .parseAsync(req.query);

      const result = await editInstitutionService.updateInstitutionShift(
        shift_id,
        institution_id,
        req.body,
      );

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  // Controller for deleting shift

  async deleteInstitutionShift(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { institution_id, shift_id } = await institutionShiftSchema
        .pick({
          shift_id: true,
          institution_id: true,
        })
        .parseAsync(req.query);

      const result = await editInstitutionService.deleteInstitutionShift(
        shift_id,
        institution_id,
      );

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  // controller for adding institution document example

  async addInstitutionAssetExample(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await editInstitutionService.addInstitutionAssetExample(
        req.body,
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  // controller for deleting institution document example

  async deleteInstitutionAssetExample(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { asset_id, institution_id } = await fileAssetSchema
        .pick({
          asset_id: true,
          institution_id: true,
        })
        .parseAsync(req.query);

      const result = editInstitutionService.deleteInstitutionAssetExample(
        asset_id,
        institution_id,
      );

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const institutionController = new InstitutionController();
