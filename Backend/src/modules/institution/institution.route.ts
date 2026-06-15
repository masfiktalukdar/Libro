import { Router } from "express";
import { institutionController } from "@modules/institution/institution.controller.js";

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

export { router as institutionRouter };
