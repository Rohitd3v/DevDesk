"use client";

import { useState } from "react";
import { useGitHubRepos, useProjectLinkedRepos } from "../hooks/useGitHubRepos";
import { GitHubRepo } from "../services/githubService";
import { useGitHubConnection } from "../hooks/useGitHubConnection";
import { GitHubConnection } from "./GitHubConnection";

interface RepositoryLinkerProps {
  projectId: string;
}

export const RepositoryLinker = ({ projectId }: RepositoryLinkerProps) => {
  const { connectionStatus } = useGitHubConnection();
  const { repositories, loading: reposLoading, error: reposError, fetchRepositories } = useGitHubRepos();
  const { linkedRepos, loading: linkedLoading, linkRepository, unlinkRepository } = useProjectLinkedRepos(projectId);

  const [showRepoSelector, setShowRepoSelector] = useState(false);
  const [linking, setLinking] = useState<number | null>(null);
  const [unlinking, setUnlinking] = useState<string | null>(null);

  // If not connected to GitHub, show connection component
  if (!connectionStatus?.connected) {
    return <GitHubConnection />;
  }

  const handleLinkRepository = async (repo: GitHubRepo) => {
    try {
      setLinking(repo.id);
      await linkRepository({
        repo_owner: repo.owner.login,
        repo_name: repo.name,
        github_repo_id: repo.id,
      });
      setShowRepoSelector(false);
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error("Failed to link repository:", error);
      alert(error.message || "Failed to link repository");
    } finally {
      setLinking(null);
    }
  };

  const handleUnlinkRepository = async (repoId: string, repoName: string) => {
    if (!confirm(`Are you sure you want to unlink ${repoName}?`)) return;

    try {
      setUnlinking(repoId);
      await unlinkRepository(repoId);
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error("Failed to unlink repository:", error);
      alert(error.message || "Failed to unlink repository");
    } finally {
      setUnlinking(null);
    }
  };

  const handleShowRepoSelector = async () => {
    setShowRepoSelector(true);
    if (repositories.length === 0) {
      await fetchRepositories();
    }
  };

  // Get linked repo IDs for filtering
  const linkedRepoIds = new Set(linkedRepos.map(repo => repo.github_repo_id));
  const availableRepos = repositories.filter(repo => !linkedRepoIds.has(repo.id));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">GitHub Repositories</h3>
        <button
          onClick={handleShowRepoSelector}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Link Repository
        </button>
      </div>

      {/* Linked Repositories */}
      {linkedLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white border rounded-lg p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      ) : linkedRepos.length === 0 ? (
        <div className="bg-gray-50 border border-dashed rounded-lg p-6 text-center">
          <p className="text-gray-600">No repositories linked yet.</p>
          <p className="text-sm text-gray-500 mt-1">
            Link a GitHub repository to sync issues with tickets.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {linkedRepos.map((repo) => (
            <div key={repo.id} className="bg-white border rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{repo.repo_name}</h3>
                  <p className="text-gray-600 text-sm truncate">{repo.repo_owner}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                      GitHub
                    </span>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      View Repo ↗
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => handleUnlinkRepository(repo.id, repo.repo_name)}
                  disabled={unlinking === repo.id}
                  className="text-red-600 px-3 py-1 hover:bg-red-50 rounded transition text-sm disabled:opacity-50 whitespace-nowrap self-start sm:self-center"
                >
                  Unlink
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Repository Selector Modal */}
      {showRepoSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Select Repository to Link</h3>
              <button
                onClick={() => setShowRepoSelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {reposError && (
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                <p className="text-red-600 text-sm">{reposError}</p>
              </div>
            )}

            <div className="overflow-y-auto flex-1">
              {reposLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-3">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : availableRepos.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <p>No available repositories to link.</p>
                  <p className="text-sm mt-1">All your repositories are already linked or you don&apos;t have any repositories.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableRepos.map((repo) => (
                    <div
                      key={repo.id}
                      className="border rounded-lg p-3 hover:bg-gray-50 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{repo.full_name}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 flex-wrap">
                            {repo.description && (
                              <span className="truncate max-w-[200px]">{repo.description}</span>
                            )}
                            <span className={`px-2 py-1 rounded text-xs ${repo.private ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                              }`}>
                              {repo.private ? 'Private' : 'Public'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleLinkRepository(repo)}
                          disabled={linking === repo.id}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 whitespace-nowrap self-start sm:self-center"
                        >
                          {linking === repo.id ? "Linking..." : "Link"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};