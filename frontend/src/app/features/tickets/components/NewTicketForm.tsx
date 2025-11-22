"use client";

import { FormEvent, useState } from "react";
import { AxiosError } from "axios";

interface NewTicketFormProps {
  onCreate: (ticket: { title: string; description: string; priority: string }) => Promise<void>;
}

export const NewTicketForm = ({ onCreate }: NewTicketFormProps) => {
  const [formData, setFormData] = useState({ title: "", description: "", priority: "medium" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onCreate(formData);
      setFormData({ title: "", description: "", priority: "medium" });
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || "Failed to create ticket");
      } else if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mb-6 bg-white p-4 rounded-xl border shadow-sm text-black">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <input
        type="text"
        placeholder="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="w-full px-3 py-2 border rounded-xl text-black"
        required
      />

      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full px-3 py-2 border rounded-xl text-black"
        required
      />

      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-700">Priority</label>
        <select
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          className="px-3 py-2 border rounded-xl bg-white text-black"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Ticket"}
      </button>
    </form>
  );
};


