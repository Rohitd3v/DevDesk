import { useEffect, useState } from "react";
import { GitHubService, GitHubRepo, LinkedRepo } from "../services/githubService";
import { AxiosError } from "axios";

export const useGitHubRepos = () => {
  const [repositories, setRepositories] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      setError(null);
      const repos = await GitHubService.getUserRepositories();
      setRepositories(repos);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error || "Failed to fetch repositories");
      } else if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    repositories,
    loading,
    error,
    fetchRepositories,
  };
};

export const useProjectLinkedRepos = (projectId: string) => {
  const [linkedRepos, setLinkedRepos] = useState<LinkedRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLinkedRepos = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      setError(null);
      const repos = await GitHubService.getProjectLinkedRepos(projectId);
      setLinkedRepos(repos);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error || "Failed to fetch linked repositories");
      } else if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const linkRepository = async (repoData: {
    repo_owner: string;
    repo_name: string;
    github_repo_id: number;
  }) => {
    try {
      await GitHubService.linkRepoToProject(projectId, repoData);
      await fetchLinkedRepos(); // Refresh the list
    } catch (err) {
      if (err instanceof AxiosError) {
        throw new Error(err.response?.data?.error || "Failed to link repository");
      }
      throw err;
    }
  };

  const unlinkRepository = async (repoId: string) => {
    try {
      await GitHubService.unlinkRepoFromProject(projectId, repoId);
      await fetchLinkedRepos(); // Refresh the list
    } catch (err) {
      if (err instanceof AxiosError) {
        throw new Error(err.response?.data?.error || "Failed to unlink repository");
      }
      throw err;
    }
  };

  useEffect(() => {
    fetchLinkedRepos();
  }, [projectId]);

  return {
    linkedRepos,
    loading,
    error,
    linkRepository,
    unlinkRepository,
    refetch: fetchLinkedRepos,
  };
};