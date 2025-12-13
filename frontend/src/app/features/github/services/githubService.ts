import apiClient from "@/app/services/apiClient";

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    id: number;
  };
  html_url: string;
  clone_url: string;
  default_branch: string;
  description?: string;
  private: boolean;
  updated_at: string;
}

export interface LinkedRepo {
  id: string;
  project_id: string;
  repo_name: string;
  repo_owner: string;
  github_repo_id: number;
  full_name: string;
  clone_url?: string;
  html_url?: string;
  default_branch?: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubConnectionStatus {
  connected: boolean;
  github_username?: string;
  avatar_url?: string;
}

export const GitHubService = {
  // Check GitHub connection status
  async getConnectionStatus(): Promise<GitHubConnectionStatus> {
    const { data } = await apiClient.get("/github/connection");
    return data;
  },

  // Get user's GitHub repositories
  async getUserRepositories(): Promise<GitHubRepo[]> {
    const { data } = await apiClient.get("/github/repositories");
    return data.repositories;
  },

  // Get linked repositories for a project
  async getProjectLinkedRepos(projectId: string): Promise<LinkedRepo[]> {
    const { data } = await apiClient.get(`/github/projects/${projectId}/repositories`);
    return data.linked_repositories;
  },

  // Link repository to project
  async linkRepoToProject(
    projectId: string,
    repoData: {
      repo_owner: string;
      repo_name: string;
      github_repo_id: number;
    }
  ): Promise<LinkedRepo> {
    const { data } = await apiClient.post(`/github/projects/${projectId}/repositories`, repoData);
    return data.linked_repository;
  },

  // Unlink repository from project
  async unlinkRepoFromProject(projectId: string, repoId: string): Promise<void> {
    await apiClient.delete(`/github/projects/${projectId}/repositories/${repoId}`);
  },

  // Initiate GitHub OAuth
  initiateGitHubAuth(redirectUrl?: string): void {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';
    const authUrl = `${backendUrl}/api/v1/auth/github`;
    
    if (redirectUrl) {
      window.location.href = `${authUrl}?redirect=${encodeURIComponent(redirectUrl)}`;
    } else {
      window.location.href = authUrl;
    }
  },
};