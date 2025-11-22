
import { login, signUp } from "../controllers/authController.js";
import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import validate from "../middleware/validateRequest.js";
import { signUpSchema, loginSchema } from "../validators/zodValidation.js";

const router = Router();

router.post("/login", validate({ body: loginSchema }), asyncHandler(login));
router.post("/signup", validate({ body: signUpSchema }), asyncHandler(signUp));

export default router;
