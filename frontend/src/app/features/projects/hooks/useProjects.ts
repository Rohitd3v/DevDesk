import { useEffect, useState } from "react";
import {
  getProjects,
  createProject,
  updateProject,
} from "../services/projectService";

export const useProjects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjects();
      setProjects(data.projects);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (project: { name: string; description: string }) => {
    await createProject(project);
    await fetchProjects(); // refresh
  };

  const editProject = async (
    id: string,
    project: { name: string; description: string },
  ) => {
    await updateProject(id, project);
    await fetchProjects();
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return { projects, loading, error, fetchProjects, addProject, editProject };
};
