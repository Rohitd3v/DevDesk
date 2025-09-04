'use client';

import { useProjects } from "@/app/features/projects/hooks/useProjects";

export default function DashboardPage() {
  const { projects, loading, error, addProject } = useProjects();

  if (loading) return <p>Loading projects...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">My Projects</h1>
      <ul>
        {projects.map((p) => (
          <li key={p.id} className="border-b py-2">
            {p.name} — {p.description}
          </li>
        ))}
      </ul>

      <button
        onClick={() => addProject({ name: "New Project", description: "Demo" })}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-xl"
      >
        Add Project
      </button>
    </div>
  );
}


