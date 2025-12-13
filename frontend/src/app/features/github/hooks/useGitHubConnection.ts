import { useEffect, useState } from "react";
import { GitHubService, GitHubConnectionStatus } from "../services/githubService";
import { AxiosError } from "axios";

export const useGitHubConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<GitHubConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      const status = await GitHubService.getConnectionStatus();
      setConnectionStatus(status);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error || "Failed to check GitHub connection");
      } else if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const connectToGitHub = () => {
    const currentUrl = window.location.origin + window.location.pathname;
    GitHubService.initiateGitHubAuth(currentUrl);
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return {
    connectionStatus,
    loading,
    error,
    connectToGitHub,
    refetch: checkConnection,
  };
};