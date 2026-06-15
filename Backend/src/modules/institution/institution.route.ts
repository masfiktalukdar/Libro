import { Router } from "express";
import { institutionController } from "@modules/institution/institution.controller.js";

const router = Router();
router.post(
  "/instituion-registration-requst",
  institutionController.institutionRequestRegister,
);

export { router as institutionRouter };
