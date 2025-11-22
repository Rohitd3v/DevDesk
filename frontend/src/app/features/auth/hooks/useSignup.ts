
import { useState } from "react";
import { signup } from "../services/authService";
import { AxiosError } from "axios";

export const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await signup(email, password);
      return data;
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || "Signup failed");
      } else if (err instanceof Error) {
        setError(err.message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { signup: handleSignup, loading, error };
};
