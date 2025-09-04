
import apiClient from "@/app/services/apiClient";

export const createProject = async (project: { name: string; description: string }) => {
  const { data } = await apiClient.post("/projects", project);
  return data;
};

export const getProjects = async () => {
  const { data } = await apiClient.get("/projects");
  return data;
};

export const getProjectById = async (id: string) => {
  const { data } = await apiClient.get(`/projects/${id}`);
  return data;
};

export const updateProject = async (id: string, project: { name: string; description: string }) => {
  const { data } = await apiClient.patch(`/projects/${id}`, project);
  return data;
};
