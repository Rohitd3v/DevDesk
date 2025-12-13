import { Router } from "express";
import {
  initiateGitHubAuth,
  handleGitHubCallback,
  handleGitHubError,
  linkGitHubAccount,
  unlinkGitHubAccount,
} from "../controllers/githubAuthController.js";
import authMiddleware from "../middleware/Authmiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

// GitHub OAuth routes
router.get("/github", asyncHandler(initiateGitHubAuth));
router.get("/github/callback", asyncHandler(handleGitHubCallback));
router.get("/github/error", handleGitHubError);

// Account linking routes (protected)
router.post("/github/link", authMiddleware, asyncHandler(linkGitHubAccount));
router.delete("/github/unlink", authMiddleware, asyncHandler(unlinkGitHubAccount));

export default router;