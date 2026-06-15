import { Router } from "express";
import { authController } from "@modules/auth/auth.controller.js";

const router = Router();

router.post("/register-user", authController.regester);

export { router as authRouter };
