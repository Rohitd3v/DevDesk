
import { useState } from "react";
import { signup } from "../services/authService";

export const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await signup(email, password);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { signup: handleSignup, loading, error };
};
