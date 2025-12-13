import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/AuthenticatedRequest.ts";
import { sendResponse } from "../utils/sendResponse.ts";
import { GitHubService, GitHubTokenService, GitHubRepoService } from "../services/githubService.ts";
import { ProjectService } from "../services/projectService.ts";

// Get user's GitHub repositories
export const getUserGitHubRepos = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return sendResponse(res, 401, false, { error: "Unauthorized" });
  }

  try {
    // Get user's GitHub token
    const { data: tokenData, error: tokenError } = await GitHubTokenService.getUserToken(userId);
    
    if (tokenError || !tokenData) {
      return sendResponse(res, 404, false, { error: "GitHub account not connected" });
    }

    // Initialize GitHub service with user's token
    const githubService = new GitHubService(tokenData.access_token);
    
    // Fetch repositories
    const repos = await githubService.getUserRepos();
    
    return sendResponse(res, 200, true, { repositories: repos });
  } catch (error: any) {
    console.error("Error fetching GitHub repos:", error);
    return sendResponse(res, 500, false, { error: error.message || "Failed to fetch repositories" });
  }
};

// Link a repository to a project
export const linkRepoToProject = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const projectId = req.params.project_id;
  const { repo_owner, repo_name, github_repo_id } = req.body;

  if (!userId) {
    return sendResponse(res, 401, false, { error: "Unauthorized" });
  }

  if (!projectId || !repo_owner || !repo_name || !github_repo_id) {
    return sendResponse(res, 400, false, { 
      error: "Missing required fields: repo_owner, repo_name, github_repo_id" 
    });
  }

  try {
    // Verify user owns the project
    const { data: project, error: projectError } = await ProjectService.getProjectById(projectId, userId);
    
    if (projectError || !project) {
      return sendResponse(res, 404, false, { error: "Project not found" });
    }

    // Get user's GitHub token
    const { data: tokenData, error: tokenError } = await GitHubTokenService.getUserToken(userId);
    
    if (tokenError || !tokenData) {
      return sendResponse(res, 404, false, { error: "GitHub account not connected" });
    }

    // Initialize GitHub service and fetch repo details
    const githubService = new GitHubService(tokenData.access_token);
    const repoDetails = await githubService.getRepo(repo_owner, repo_name);

    // Link repository to project
    const { data: linkedRepo, error: linkError } = await GitHubRepoService.linkRepoToProject(
      projectId,
      {
        repo_name: repoDetails.name,
        repo_owner: repoDetails.owner.login,
        github_repo_id: repoDetails.id,
        full_name: repoDetails.full_name,
        clone_url: repoDetails.clone_url,
        html_url: repoDetails.html_url,
        default_branch: repoDetails.default_branch,
      }
    );

    if (linkError) {
      if (linkError.code === "23505") { // Unique constraint violation
        return sendResponse(res, 409, false, { error: "Repository already linked to this project" });
      }
      throw linkError;
    }

    return sendResponse(res, 201, true, { linked_repository: linkedRepo });
  } catch (error: any) {
    console.error("Error linking repository:", error);
    return sendResponse(res, 500, false, { error: error.message || "Failed to link repository" });
  }
};

// Get linked repositories for a project
export const getProjectLinkedRepos = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const projectId = req.params.project_id;

  if (!userId) {
    return sendResponse(res, 401, false, { error: "Unauthorized" });
  }

  if (!projectId) {
    return sendResponse(res, 400, false, { error: "Project ID is required" });
  }

  try {
    // Verify user owns the project
    const { data: project, error: projectError } = await ProjectService.getProjectById(projectId, userId);
    
    if (projectError || !project) {
      return sendResponse(res, 404, false, { error: "Project not found" });
    }

    // Get linked repositories
    const { data: linkedRepos, error: reposError } = await GitHubRepoService.getProjectRepos(projectId);
    
    if (reposError) {
      throw reposError;
    }

    return sendResponse(res, 200, true, { linked_repositories: linkedRepos || [] });
  } catch (error: any) {
    console.error("Error fetching linked repositories:", error);
    return sendResponse(res, 500, false, { error: error.message || "Failed to fetch linked repositories" });
  }
};

// Unlink repository from project
export const unlinkRepoFromProject = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const projectId = req.params.project_id;
  const repoId = req.params.repo_id;

  if (!userId) {
    return sendResponse(res, 401, false, { error: "Unauthorized" });
  }

  if (!projectId || !repoId) {
    return sendResponse(res, 400, false, { error: "Project ID and Repository ID are required" });
  }

  try {
    // Verify user owns the project
    const { data: project, error: projectError } = await ProjectService.getProjectById(projectId, userId);
    
    if (projectError || !project) {
      return sendResponse(res, 404, false, { error: "Project not found" });
    }

    // Get repository details to verify it belongs to the project
    const { data: repo, error: repoError } = await GitHubRepoService.getRepoById(repoId);
    
    if (repoError || !repo || repo.project_id !== projectId) {
      return sendResponse(res, 404, false, { error: "Repository not found or not linked to this project" });
    }

    // Unlink repository
    const { error: unlinkError } = await GitHubRepoService.unlinkRepo(repoId);
    
    if (unlinkError) {
      throw unlinkError;
    }

    return sendResponse(res, 200, true, { message: "Repository unlinked successfully" });
  } catch (error: any) {
    console.error("Error unlinking repository:", error);
    return sendResponse(res, 500, false, { error: error.message || "Failed to unlink repository" });
  }
};

// Get GitHub connection status for user
export const getGitHubConnectionStatus = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return sendResponse(res, 401, false, { error: "Unauthorized" });
  }

  try {
    const { data: tokenData, error: tokenError } = await GitHubTokenService.getUserToken(userId);
    
    const isConnected = !tokenError && !!tokenData;
    
    return sendResponse(res, 200, true, { 
      connected: isConnected,
      github_username: tokenData?.github_username || null,
      avatar_url: tokenData?.avatar_url || null,
    });
  } catch (error: any) {
    console.error("Error checking GitHub connection:", error);
    return sendResponse(res, 500, false, { error: "Failed to check GitHub connection status" });
  }
};