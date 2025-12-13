"use client";

import { useGitHubConnection } from "../hooks/useGitHubConnection";

interface GitHubConnectionProps {
  showDetails?: boolean;
  className?: string;
}

export const GitHubConnection = ({ showDetails = true, className = "" }: GitHubConnectionProps) => {
  const { connectionStatus, loading, error, connectToGitHub } = useGitHubConnection();

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (!connectionStatus?.connected) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-900">Connect to GitHub</h3>
            {showDetails && (
              <p className="text-sm text-blue-700 mt-1">
                Link your GitHub account to sync repositories and issues
              </p>
            )}
          </div>
          <button
            onClick={connectToGitHub}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
          >
            <GitHubIcon />
            Connect GitHub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {connectionStatus.avatar_url && (
            <img
              src={connectionStatus.avatar_url}
              alt="GitHub Avatar"
              className="w-8 h-8 rounded-full"
            />
          )}
          <div>
            <h3 className="font-medium text-green-900">
              Connected to GitHub
            </h3>
            {showDetails && connectionStatus.github_username && (
              <p className="text-sm text-green-700">
                @{connectionStatus.github_username}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Connected
          </span>
        </div>
      </div>
    </div>
  );
};

const GitHubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);