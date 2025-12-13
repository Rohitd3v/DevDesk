
import express, { Router } from "express";
import { login, signUp } from "../controllers/authController.ts";
import asyncHandler from "../utils/asyncHandler.ts";
import validate from "../middleware/validateRequest.ts";
import { signUpSchema, loginSchema } from "../validators/zodValidation.ts";

const router = express.Router();

router.post("/login", validate({ body: loginSchema }), asyncHandler(login));
router.post("/signup", validate({ body: signUpSchema }), asyncHandler(signUp));

export default router;
