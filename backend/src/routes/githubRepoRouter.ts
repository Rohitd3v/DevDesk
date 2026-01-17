import express, { Router } from "express";
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

const router = express.Router();

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

// Ticket sync status
import { getTicketSyncStatus } from "../controllers/githubRepoController.js";
import { ticketParamsSchema } from "../validators/zodValidation.js";

router.get("/tickets/:ticket_id/sync",
  validate({ params: ticketParamsSchema }),
  asyncHandler(getTicketSyncStatus)
);

export default router;