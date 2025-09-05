"use client";

import { useProjects } from "@/app/features/projects/hooks/useProjects";

export default function DashboardPage() {
  const { projects, loading, error } = useProjects();

  if (loading)
    return (
      <div className="p-6 text-black">
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
      </div>
    );
  if (error)
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );

  return (
    <div className="p-6 text-black">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">My Projects</h1>
        <span className="text-sm text-gray-600">{projects.length} total</span>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <li key={p.id} className="rounded-xl border bg-white p-4 shadow-sm hover:shadow transition">
            <h3 className="font-semibold mb-1">{p.name}</h3>
            <p className="text-gray-700 text-sm line-clamp-3">{p.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
