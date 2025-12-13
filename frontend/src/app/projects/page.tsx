"use client";

import { useProjects } from "../features/projects/hooks/useProjects";
import { ProjectsList } from "../features/projects/components/ProjectsList";
import { NewProjectForm } from "../features/projects/components/NewProjectForm";
import { ProtectedRoute } from "../components/ProtectedRoute";

function ProjectsContent() {
  const { projects, loading, error, addProject } = useProjects();

  return (
    <div className="max-w-4xl mx-auto text-black">
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

export default function ProjectsPage() {
  return (
    <ProtectedRoute>
      <ProjectsContent />
    </ProtectedRoute>
  );
}
