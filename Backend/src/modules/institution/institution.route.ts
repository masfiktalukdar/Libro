import { Router } from "express";
import { institutionController } from "@modules/institution/institution.controller.js";
import { institutionMIddleware } from "@modules/institution/institution.middleware.js";
import { verifyOTPMiddleware } from "@middlewares/verifyOTPMiddleware.js";
import { inputValidator } from "@middlewares/inputValidator.js";
import {
  institutionRegistrationRequestSchema,
  institutionRegistrationOTP,
  institutionCreationSchema,
  institutionSchema,
  institutionDepartmentSchema,
} from "@modules/institution/institution.validator.js";
import z from "zod";

const router = Router();

// Sending OTP for registration reqeust
router.post(
  "/sent-registration-request-otp",
  inputValidator.validate(institutionRegistrationOTP),
  institutionController.sentOTPForInstitutionRegistrationRequest,
);

// very OTP and creating Institution Registration Request
router.post(
  "/verify-registration-request-otp",
  inputValidator.validate(institutionRegistrationRequestSchema),
  verifyOTPMiddleware("institution_email"),
  institutionController.institutionRequestRegister,
);

// Editing Registration Request
router.patch(
  "/edit-registration-request",
  institutionController.institutionRequestEdit,
);

// Sending institution creation link
router.post(
  "/sent-institution-creation-link",
  institutionController.institutionCreationInvitation,
);

// Creating a new institution
router.post(
  "/institution-creation",
  institutionMIddleware.verifyInstitutionRegistrationToken,
  inputValidator.validate(institutionCreationSchema),
  institutionController.newInstitutionCreation,
);

// edit Institution name
router.patch(
  "/edit-institution-name",
  inputValidator.validate(
    institutionCreationSchema
      .pick({ institution_name: true })
      .extend({ institution_id: z.uuid() }),
  ),
  institutionController.editInstitutionName,
);

// edit institution general fields
router.patch(
  "/update-institution-fields",
  inputValidator.validate(institutionSchema.partial()),
  institutionController.updateInstitutionGeneralData,
);

// edit institution sensetive fields
router.patch(
  "/update-institution-sensitive-fields",
  inputValidator.validate(
    institutionSchema
      .pick({
        institution_id: true,
        institution_password_text: true,
        institution_email: true,
      })
      .extend({
        new_password_plaintext:
          institutionSchema.shape.institution_password_text,
      })
      .partial(),
  ),
  institutionController.updateInstitutionSensetiveData,
);

// Creating department for institution
router.post(
  "/create-institution-department",
  inputValidator.validate(institutionDepartmentSchema.partial()),
  institutionController.createInstitutionDepartment,
);

export { router as institutionRouter };
