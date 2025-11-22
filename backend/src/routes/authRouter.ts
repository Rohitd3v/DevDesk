
import { login, signUp } from "../controllers/authController.js";
import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import validateRequest from "../middleware/validateRequest.js";
import { signUpSchema, loginSchema } from "../validators/zodValidation.js";

const router = Router();

router.post("/login", validateRequest(loginSchema), asyncHandler(login));
router.post("/signup", validateRequest(signUpSchema), asyncHandler(signUp));

export default router;
