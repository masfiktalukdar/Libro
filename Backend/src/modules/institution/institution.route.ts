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
  institutionShiftSchema,
  fileAssetSchema,
  automaticRegistrationKeywordSchema,
  addRecurringHolidaySchema,
  addManualHolidaySchema,
} from "@modules/institution/institution.validator.js";
import z from "zod";

const router = Router();

// Section 1: Onboarding & Registration Requests

// Sending OTP for registration request
router.post(
  "/sent-registration-request-otp",
  inputValidator.validate(institutionRegistrationOTP),
  institutionController.sentOTPForInstitutionRegistrationRequest,
);

// Verify OTP and creating Institution Registration Request
router.post(
  "/verify-registration-request-otp",
  inputValidator.validate(institutionRegistrationRequestSchema),
  verifyOTPMiddleware("institution_email"),
  institutionController.institutionRequestRegister,
);

// Editing Registration Request
router.patch(
  "/edit-registration-request",
  institutionMIddleware.verifyAuthToken,
  institutionController.institutionRequestEdit,
);

// Sending institution creation link
router.post(
  "/sent-institution-creation-link",
  institutionMIddleware.verifyAuthToken,
  institutionController.institutionCreationInvitation,
);

// Get institution registration requests
router.get(
  "/get-registration-requests",
  institutionMIddleware.verifyAuthToken,
  institutionController.getRegistrationRequests,
);

// Creating a new institution
router.post(
  "/institution-creation",
  institutionMIddleware.verifyInstitutionRegistrationToken,
  inputValidator.validate(institutionCreationSchema),
  institutionController.newInstitutionCreation,
);

// Section 2: Institution Profile & Settings

// Get institution details
router.get(
  "/get-institution-details",
  institutionMIddleware.verifyAuthToken,
  institutionController.getInstitutionDetails,
);

// Edit Institution name
router.patch(
  "/edit-institution-name",
  institutionMIddleware.verifyAuthToken,
  inputValidator.validate(
    institutionCreationSchema
      .pick({ institution_name: true })
      .extend({ institution_id: z.uuid() }),
  ),
  institutionController.editInstitutionName,
);

// Edit institution general fields
router.patch(
  "/update-institution-fields",
  institutionMIddleware.verifyAuthToken,
  inputValidator.validate(institutionSchema.partial()),
  institutionController.updateInstitutionGeneralData,
);

// Edit institution sensitive fields
router.patch(
  "/update-institution-sensitive-fields",
  institutionMIddleware.verifyAuthToken,
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

// Section 3: Academic Departments

// Get departments for institution
router.get(
  "/get-institution-departments",
  institutionMIddleware.verifyAuthToken,
  institutionController.getInstitutionDepartments,
);

// Creating department for institution
router.post(
  "/create-institution-department",
  institutionMIddleware.verifyAuthToken,
  inputValidator.validate(institutionDepartmentSchema.partial()),
  institutionController.createInstitutionDepartment,
);

// Deleting department for institution
router.delete(
  "/delete-institution-department",
  institutionMIddleware.verifyAuthToken,
  institutionController.deleteInstitutionDepartment,
);

// Section 4: Academic Shifts

// Get shifts for institution
router.get(
  "/get-institution-shifts",
  institutionMIddleware.verifyAuthToken,
  institutionController.getInstitutionShifts,
);

// Create new Institution shift
router.post(
  "/create-institution-shift",
  institutionMIddleware.verifyAuthToken,
  inputValidator.validate(institutionShiftSchema.partial()),
  institutionController.createInstitutionShift,
);

// Update Institution shift
router.patch(
  "/update-institution-shift",
  institutionMIddleware.verifyAuthToken,
  inputValidator.validate(
    institutionShiftSchema.omit({
      shift_id: true,
      institution_id: true,
    }),
  ),
  institutionController.updateInstitutionShift,
);

// Delete Institution shift
router.delete(
  "/delete-institution-shift",
  institutionMIddleware.verifyAuthToken,
  institutionController.deleteInstitutionShift,
);

// Section 5: Document Assets & Verification Examples

// Get institution document assets
router.get(
  "/get-institution-documents",
  institutionMIddleware.verifyAuthToken,
  institutionController.getInstitutionDocuments,
);

// Add institution document example
router.post(
  "/add-institution-document",
  institutionMIddleware.verifyAuthToken,
  inputValidator.validate(fileAssetSchema.partial()),
  institutionController.addInstitutionAssetExample,
);

// Delete institution document example
router.delete(
  "/delete-institution-document",
  institutionMIddleware.verifyAuthToken,
  institutionController.deleteInstitutionAssetExample,
);

// Section 6: Registration Automation Keywords

// Get automatic registration keywords
router.get(
  "/get-automatic-registration-keywords",
  institutionMIddleware.verifyAuthToken,
  institutionController.getAutomaticRegistrationKeywords,
);

// Add institution automatic registration keyword
router.post(
  "/add-automatic-registration-keyword",
  institutionMIddleware.verifyAuthToken,
  inputValidator.validate(automaticRegistrationKeywordSchema.partial()),
  institutionController.addAutomaticRegistrationKeyword,
);

// Delete institution automatic registration keyword
router.delete(
  "/remove-automatic-registration-keyword",
  institutionMIddleware.verifyAuthToken,
  institutionController.removeAutomaticRegistrationKeyword,
);

// Section 7: Holidays & Calendar

// Get institution holidays
router.get(
  "/get-institution-holidays",
  institutionMIddleware.verifyAuthToken,
  institutionController.getInstitutionHolidays,
);

// Add recurring holiday (e.g. weekly closures like Friday, Saturday)
router.post(
  "/add-recurring-holiday",
  institutionMIddleware.verifyAuthToken,
  inputValidator.validate(addRecurringHolidaySchema),
  institutionController.addRecurringHoliday,
);

// Add manual holiday (single specific date or date range)
router.post(
  "/add-manual-holiday",
  institutionMIddleware.verifyAuthToken,
  inputValidator.validate(addManualHolidaySchema),
  institutionController.addManualHoliday,
);

// Delete institution holiday
router.delete(
  "/delete-institution-holiday",
  institutionMIddleware.verifyAuthToken,
  institutionController.deleteInstitutionHoliday,
);

export { router as institutionRouter };
