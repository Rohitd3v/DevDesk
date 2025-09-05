"use client";

import { useProjects } from "../features/projects/hooks/useProjects";
import { ProjectsList } from "../features/projects/components/ProjectsList";
import { NewProjectForm } from "../features/projects/components/NewProjectForm";

export default function ProjectsPage() {
  const { projects, loading, error, addProject } = useProjects();

  return (
    <div className="max-w-3xl mx-auto p-6 text-black">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <span className="text-sm text-gray-600">{projects.length} total</span>
      </div>

      <NewProjectForm onCreate={addProject} />

      {loading && (
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
        </div>
      )}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && <ProjectsList projects={projects} />}
    </div>
  );
}
