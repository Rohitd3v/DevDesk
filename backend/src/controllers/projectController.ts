import { sendResponse } from "../utils/sendResponse.js";
import { ProjectService } from "../services/projectService.js";
import type { AuthenticatedRequest } from "../types/AuthenticatedRequest.js";
import type { Response } from "express";


// List all projects for a user
export const getprojectbyUser = async (req: AuthenticatedRequest, res: Response) => {

  const userId = req.user?.id;
  if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" });

  const { data, error } = await ProjectService.getProjectsByUser(userId);

  if (error) return sendResponse(res, 500, false, { error: error.message });
  if (!data || data.length === 0) return sendResponse(res, 404, false, { error: "No projects found" });

  return sendResponse(res, 200, true, { projects: data });
};

// Fetch project details
export const getProjectsbyId = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const projectId = req.params.P_id;
  if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" });

  const { data, error } = await ProjectService.getProjectById(projectId, userId);

  if (error) return sendResponse(res, 500, false, { error: error.message });
  if (!data) return sendResponse(res, 404, false, { error: "Project not found" });

  return sendResponse(res, 200, true, { project: data });
}

// Create new project
export const creatProject = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { name, description } = req.body;
  if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" });

  const { data, error } = await ProjectService.createProject(name, description, userId);

  if (error) return sendResponse(res, 500, false, { error: error.message });
  return sendResponse(res, 201, true, { project: data });

};


//update a project details

export const updateProject = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const project_id = req.params.P_id;
  const { name, description } = req.body;
  if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" })

  const { data, error } = await ProjectService.updateProject(project_id, userId, name, description);

  if (error) return sendResponse(res, 500, false, { error: error.message });
  return sendResponse(res, 200, true, { project: data });
};

// Delete project
export const deleteProject = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const projectId = req.params.P_id;

  if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" });

  const { error } = await ProjectService.deleteProject(projectId, userId);

  if (error) return sendResponse(res, 500, false, { error: error.message });

  return sendResponse(res, 200, true, { message: "Project deleted successfully" });
};
