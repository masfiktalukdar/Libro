import { Request, Response, NextFunction } from "express";
import { institutionServices } from "@modules/institution/institution.services.js";
import { editInstitutionService } from "@modules/institution/editInstitution.services.js";
import { institutionRepository } from "./institution.repository.js";
import {
  automaticRegistrationKeywordSchema,
  fileAssetSchema,
  institutionDepartmentSchema,
  institutionShiftSchema,
  deleteInstitutionHolidaySchema,
  getInstitutionHolidaysQuerySchema,
  getInstitutionDepartmentsQuerySchema,
  getInstitutionShiftsQuerySchema,
  getInstitutionDetailsQuerySchema,
  getAutomaticRegistrationKeywordsQuerySchema,
  getInstitutionDocumentsQuerySchema,
  getRegistrationRequestsQuerySchema,
} from "./institution.validator.js";
import {
  OTP_PURPOSE,
  OTP_SUBJECTS,
  otpService,
} from "@/services/otpService.js";
import { userSignUpOTPTemplate } from "@/templates/userSignUpOTP.js";
import { AppError } from "@/utils/appError.js";

export class InstitutionController {
  // Section 1: Onboarding & Registration Requests

  // Controller for sent institution request registration OTP
  async sentOTPForInstitutionRegistrationRequest(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { institution_email } = req.body;
      await otpService.sendOTP(
        institution_email,
        OTP_SUBJECTS.registration_request,
        OTP_PURPOSE.registration_request,
        userSignUpOTPTemplate,
      );

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

  // Controller for getting institution registration requests
  async getRegistrationRequests(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const validatedQuery =
        await getRegistrationRequestsQuerySchema.parseAsync(req.query);

      const result =
        await institutionServices.getRegistrationRequests(validatedQuery);

      res.status(200).json(result);
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

  // Section 2: Institution Profile & Settings

  // Controller for getting institution details by ID or Slug
  async getInstitutionDetails(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const validatedQuery = await getInstitutionDetailsQuerySchema.parseAsync(
        req.query,
      );

      const result =
        await editInstitutionService.getInstitutionDetails(validatedQuery);

      res.status(200).json(result);
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

  // Controller for updating general data of an institution
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

  // Controller for updating sensitive data of an institution
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

  // Section 3: Academic Departments

  // Controller for getting all departments for an institution
  async getInstitutionDepartments(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { institution_id } =
        await getInstitutionDepartmentsQuerySchema.parseAsync(req.query);

      const result =
        await editInstitutionService.getInstitutionDepartments(institution_id);

      res.status(200).json(result);
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

  // Section 4: Academic Shifts

  // Controller for getting all shifts for an institution
  async getInstitutionShifts(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { institution_id } =
        await getInstitutionShiftsQuerySchema.parseAsync(req.query);

      const result =
        await editInstitutionService.getInstitutionShifts(institution_id);

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

  // Section 5: Document Assets & Verification Examples

  // Controller for getting document assets of an institution
  async getInstitutionDocuments(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { institution_id, asset_scope } =
        await getInstitutionDocumentsQuerySchema.parseAsync(req.query);

      const result = await editInstitutionService.getInstitutionDocuments(
        institution_id,
        asset_scope,
      );

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  // Controller for adding institution document example
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

  // Controller for deleting institution document example
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

  // Section 6: Registration Automation Keywords

  // Controller for getting automatic registration keywords
  async getAutomaticRegistrationKeywords(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { institution_id } =
        await getAutomaticRegistrationKeywordsQuerySchema.parseAsync(req.query);

      const result =
        await editInstitutionService.getAutomaticRegistrationKeywords(
          institution_id,
        );

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  // Controller for adding new automatic registration keyword
  async addAutomaticRegistrationKeyword(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result =
        await editInstitutionService.addAutomaticRegistrationKeyword(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  // Controller for removing automatic registration keyword
  async removeAutomaticRegistrationKeyword(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { keyword_id, institution_id } =
        await automaticRegistrationKeywordSchema
          .omit({
            keyword_value: true,
          })
          .parseAsync(req.query);

      const result =
        await editInstitutionService.removeAutomaticRegistrationKeyword(
          keyword_id,
          institution_id,
        );

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  // Section 7: Holidays & Calendar

  // Controller for getting all holidays for an institution
  async getInstitutionHolidays(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { institution_id, holiday_type } =
        await getInstitutionHolidaysQuerySchema.parseAsync(req.query);

      const result = await editInstitutionService.getInstitutionHolidays(
        institution_id,
        holiday_type,
      );

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  // Controller for adding recurring holiday
  async addRecurringHoliday(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await editInstitutionService.addRecurringHoliday(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  // Controller for adding manual holiday (single date or range)
  async addManualHoliday(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await editInstitutionService.addManualHoliday(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  // Controller for deleting holiday
  async deleteInstitutionHoliday(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { institution_id, institution_holidays_id } =
        await deleteInstitutionHolidaySchema.parseAsync(req.query);

      const result = await editInstitutionService.deleteInstitutionHoliday(
        institution_holidays_id,
        institution_id,
      );

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const institutionController = new InstitutionController();
