import { Octokit } from "@octokit/rest";
import { supabase } from "../config/supabaseClient.js";

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
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: "open" | "closed";
  html_url: string;
  user: {
    login: string;
    id: number;
  };
  created_at: string;
  updated_at: string;
  labels: Array<{
    name: string;
    color: string;
  }>;
}

export class GitHubService {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    });
  }

  // Get user's GitHub repositories
  async getUserRepos(): Promise<GitHubRepo[]> {
    try {
      const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
        sort: "updated",
        per_page: 100,
      });
      return data as GitHubRepo[];
    } catch (error) {
      console.error("Error fetching GitHub repos:", error);
      throw new Error("Failed to fetch GitHub repositories");
    }
  }

  // Get specific repository
  async getRepo(owner: string, repo: string): Promise<GitHubRepo> {
    try {
      const { data } = await this.octokit.rest.repos.get({
        owner,
        repo,
      });
      return data as GitHubRepo;
    } catch (error) {
      console.error("Error fetching GitHub repo:", error);
      throw new Error("Failed to fetch GitHub repository");
    }
  }

  // Create GitHub issue from DevDesk ticket
  async createIssue(
    owner: string,
    repo: string,
    title: string,
    body?: string,
    labels?: string[]
  ): Promise<GitHubIssue> {
    try {
      const { data } = await this.octokit.rest.issues.create({
        owner,
        repo,
        title,
        body,
        labels,
      });
      return data as GitHubIssue;
    } catch (error) {
      console.error("Error creating GitHub issue:", error);
      throw new Error("Failed to create GitHub issue");
    }
  }

  // Update GitHub issue
  async updateIssue(
    owner: string,
    repo: string,
    issueNumber: number,
    updates: {
      title?: string;
      body?: string;
      state?: "open" | "closed";
      labels?: string[];
    }
  ): Promise<GitHubIssue> {
    try {
      const { data } = await this.octokit.rest.issues.update({
        owner,
        repo,
        issue_number: issueNumber,
        ...updates,
      });
      return data as GitHubIssue;
    } catch (error) {
      console.error("Error updating GitHub issue:", error);
      throw new Error("Failed to update GitHub issue");
    }
  }

  // Get GitHub issue
  async getIssue(owner: string, repo: string, issueNumber: number): Promise<GitHubIssue> {
    try {
      const { data } = await this.octokit.rest.issues.get({
        owner,
        repo,
        issue_number: issueNumber,
      });
      return data as GitHubIssue;
    } catch (error) {
      console.error("Error fetching GitHub issue:", error);
      throw new Error("Failed to fetch GitHub issue");
    }
  }

  // Get repository issues
  async getRepoIssues(owner: string, repo: string): Promise<GitHubIssue[]> {
    try {
      const { data } = await this.octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: "all",
        per_page: 100,
      });
      return data as GitHubIssue[];
    } catch (error) {
      console.error("Error fetching GitHub issues:", error);
      throw new Error("Failed to fetch GitHub issues");
    }
  }

  // Add comment to GitHub issue
  async addComment(
    owner: string,
    repo: string,
    issueNumber: number,
    body: string
  ): Promise<void> {
    try {
      await this.octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: issueNumber,
        body,
      });
    } catch (error) {
      console.error("Error adding GitHub comment:", error);
      throw new Error("Failed to add comment to GitHub issue");
    }
  }

  // Get authenticated user info
  async getAuthenticatedUser() {
    try {
      const { data } = await this.octokit.rest.users.getAuthenticated();
      return data;
    } catch (error) {
      console.error("Error fetching GitHub user:", error);
      throw new Error("Failed to fetch GitHub user information");
    }
  }
}

// Static methods for database operations
export const GitHubTokenService = {
  // Store GitHub token for user
  async storeUserToken(
    userId: string,
    accessToken: string,
    refreshToken?: string,
    githubUser?: any
  ) {
    return supabase
      .from("user_github_tokens")
      .upsert({
        user_id: userId,
        access_token: accessToken,
        refresh_token: refreshToken,
        github_username: githubUser?.login,
        github_user_id: githubUser?.id,
        avatar_url: githubUser?.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
  },

  // Get user's GitHub token
  async getUserToken(userId: string) {
    return supabase
      .from("user_github_tokens")
      .select("*")
      .eq("user_id", userId)
      .single();
  },

  // Delete user's GitHub token
  async deleteUserToken(userId: string) {
    return supabase
      .from("user_github_tokens")
      .delete()
      .eq("user_id", userId);
  },
};

// Repository linking service
export const GitHubRepoService = {
  // Link repository to project
  async linkRepoToProject(
    projectId: string,
    repoData: {
      repo_name: string;
      repo_owner: string;
      github_repo_id: number;
      full_name: string;
      clone_url?: string;
      html_url?: string;
      default_branch?: string;
    }
  ) {
    return supabase
      .from("github_linked_repos")
      .insert({
        project_id: projectId,
        ...repoData,
      })
      .select()
      .single();
  },

  // Get linked repositories for project
  async getProjectRepos(projectId: string) {
    return supabase
      .from("github_linked_repos")
      .select("*")
      .eq("project_id", projectId);
  },

  // Unlink repository from project
  async unlinkRepo(repoId: string) {
    return supabase
      .from("github_linked_repos")
      .delete()
      .eq("id", repoId);
  },

  // Get repository by ID
  async getRepoById(repoId: string) {
    return supabase
      .from("github_linked_repos")
      .select("*")
      .eq("id", repoId)
      .single();
  },
};

// Issue synchronization service
export const GitHubSyncService = {
  // Create sync relationship between ticket and GitHub issue
  async createSyncRelation(
    ticketId: string,
    githubIssueId: number,
    githubIssueNumber: number,
    repoId: string,
    syncDirection: "devdesk_to_github" | "github_to_devdesk" | "bidirectional" = "bidirectional"
  ) {
    return supabase
      .from("github_synced_issues")
      .insert({
        ticket_id: ticketId,
        github_issue_id: githubIssueId,
        github_issue_number: githubIssueNumber,
        repo_id: repoId,
        sync_direction: syncDirection,
      })
      .select()
      .single();
  },

  // Get sync relation by ticket ID
  async getSyncByTicketId(ticketId: string) {
    return supabase
      .from("github_synced_issues")
      .select(`
        *,
        github_linked_repos (*)
      `)
      .eq("ticket_id", ticketId)
      .single();
  },

  // Get sync relation by GitHub issue
  async getSyncByGitHubIssue(repoId: string, issueNumber: number) {
    return supabase
      .from("github_synced_issues")
      .select(`
        *,
        tickets (*),
        github_linked_repos (*)
      `)
      .eq("repo_id", repoId)
      .eq("github_issue_number", issueNumber)
      .single();
  },

  // Update last synced timestamp
  async updateLastSynced(syncId: string) {
    return supabase
      .from("github_synced_issues")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", syncId);
  },

  // Delete sync relation
  async deleteSyncRelation(syncId: string) {
    return supabase
      .from("github_synced_issues")
      .delete()
      .eq("id", syncId);
  },
};