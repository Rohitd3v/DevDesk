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
        className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>
    </form>
  )
}
