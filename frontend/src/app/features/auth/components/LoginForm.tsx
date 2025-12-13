"use client"
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "../hooks/useLogin";

export const LoginForm = () => {
  const router = useRouter();
  const { login, loading, error } = useLogin();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      router.push("/dashboard");
    } catch {
      // error is already set inside the hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className="w-full px-3 py-2 border rounded-xl text-black"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        className="w-full px-3 py-2 border rounded-xl text-black"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <div className="text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={() => router.push("/signup")}
          className="text-blue-600 hover:underline"
        >
          Sign up
        </button>
      </div>
    </form>
  );
};
