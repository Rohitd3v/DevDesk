
import { useState } from "react";
import { login } from "../services/authService";
import { AxiosError } from "axios";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await login(email, password);
      return data;
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || "Login failed");
      } else if (err instanceof Error) {
        setError(err.message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return { login: handleLogin, loading, error };
};
