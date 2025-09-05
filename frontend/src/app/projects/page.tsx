"use client";

import { useProjects } from "../features/projects/hooks/useProjects";
import { ProjectsList } from "../features/projects/components/ProjectsList";
import { NewProjectForm } from "../features/projects/components/NewProjectForm";

export default function ProjectsPage() {
  const { projects, loading, error, addProject } = useProjects();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-black">Projects</h1>

      <NewProjectForm onCreate={addProject} />

      {loading && <p>Loading projects...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && <ProjectsList projects={projects} />}
    </div>
  );
}
