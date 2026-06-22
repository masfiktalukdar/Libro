import { Router } from "express";
import { institutionController } from "@modules/institution/institution.controller.js";
import { institutionMIddleware } from "@modules/institution/institution.middleware.js";

const router = Router();
// Creating Registration Request
router.post(
  "/instituion-registration-request",
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
  institutionController.newInstitutionCreation,
);

export { router as institutionRouter };
