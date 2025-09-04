"use client";

import { FormEvent, useState } from "react";

interface NewProjectFormProps {
  onCreate: (project: { name: string; description: string }) => Promise<void>;
}

export const NewProjectForm = ({ onCreate }: NewProjectFormProps) => {
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onCreate(formData);
      setFormData({ name: "", description: "" }); // reset form
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mb-6">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <input
        type="text"
        placeholder="Project Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full px-3 py-2 border rounded-xl"
        required
      />

      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        className="w-full px-3 py-2 border rounded-xl"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Project"}
      </button>
    </form>
  );
};
