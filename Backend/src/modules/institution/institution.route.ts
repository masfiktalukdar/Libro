import { Router } from "express";
import { institutionController } from "@modules/institution/institution.controller.js";
import { institutionMIddleware } from "@modules/institution/institution.middleware.js";
import { verifyOTPMiddleware } from "@middlewares/verifyOTPMiddleware.js";
import { inputValidator } from "@middlewares/inputValidator.js";
import {
  institutionRegistrationRequestSchema,
  institutionRegistrationOTP,
  institutionCreationSchema,
} from "@modules/institution/institution.validator.js";

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
router.post(
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

export { router as institutionRouter };
