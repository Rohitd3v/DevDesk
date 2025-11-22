import { useEffect, useState } from "react";
import {
  getProjects,
  createProject,
  updateProject,
} from "../services/projectService";
import { AxiosError } from "axios";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjects();
      setProjects(data.projects);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || "Failed to load projects");
      } else if (err instanceof Error) {
        setError(err.message);
      }
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
