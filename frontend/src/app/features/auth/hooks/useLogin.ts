
import { useState } from "react";
import { login } from "../services/authService";
import { useAuth } from "../../../contexts/AuthContext";
import { AxiosError } from "axios";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await login(email, password);
      setUser(data.user);
      return data;
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error || "Login failed");
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
