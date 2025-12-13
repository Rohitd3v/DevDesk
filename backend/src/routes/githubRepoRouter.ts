import { Router } from "express";
import {
  getUserGitHubRepos,
  linkRepoToProject,
  getProjectLinkedRepos,
  unlinkRepoFromProject,
  getGitHubConnectionStatus,
} from "../controllers/githubRepoController.js";
import authMiddleware from "../middleware/Authmiddleware.js";
import validate from "../middleware/validateRequest.js";
import { linkRepoSchema, projectParamsSchema, repoParamsSchema } from "../validators/githubValidation.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GitHub connection status
router.get("/connection", asyncHandler(getGitHubConnectionStatus));

// User's GitHub repositories
router.get("/repositories", asyncHandler(getUserGitHubRepos));

// Project-specific repository management
router.get("/projects/:project_id/repositories", 
  validate({ params: projectParamsSchema }), 
  asyncHandler(getProjectLinkedRepos)
);

router.post("/projects/:project_id/repositories", 
  validate({ params: projectParamsSchema, body: linkRepoSchema }), 
  asyncHandler(linkRepoToProject)
);

router.delete("/projects/:project_id/repositories/:repo_id", 
  validate({ params: repoParamsSchema }), 
  asyncHandler(unlinkRepoFromProject)
);

export default router;