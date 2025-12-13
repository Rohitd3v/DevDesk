import express, { Router } from "express";
import {
  initiateGitHubAuth,
  handleGitHubCallback,
  handleGitHubError,
  linkGitHubAccount,
  unlinkGitHubAccount,
} from "../controllers/githubAuthController.ts";
import authMiddleware from "../middleware/Authmiddleware.ts";
import asyncHandler from "../utils/asyncHandler.ts";

const router = express.Router();

// GitHub OAuth routes
router.get("/github", asyncHandler(initiateGitHubAuth));
router.get("/github/callback", asyncHandler(handleGitHubCallback));
router.get("/github/error", handleGitHubError);

// Account linking routes (protected)
router.post("/github/link", authMiddleware, asyncHandler(linkGitHubAccount));
router.delete("/github/unlink", authMiddleware, asyncHandler(unlinkGitHubAccount));

export default router;