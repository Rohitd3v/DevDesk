"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSignup } from "../hooks/useSignup";

export const SignupForm = () => {
  const router = useRouter();
  const { signup, loading, error } = useSignup();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await signup(formData.email, formData.password);
      router.push("/login");
    } catch {

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
        className="appearance-none block w-full px-4 py-3 border rounded-xl text-black text-base cursor-text placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        className="appearance-none block w-full px-4 py-3 border rounded-xl text-black text-base cursor-text placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>

      <div className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="text-blue-600 hover:underline"
        >
          Sign in
        </button>
      </div>
    </form>
  );
};
