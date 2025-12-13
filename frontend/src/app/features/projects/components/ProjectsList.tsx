"use client";

import Link from "next/link";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export const ProjectsList = ({ projects }: { projects: Project[] }) => {
  if (!projects.length) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center text-gray-700 bg-white">
        No projects yet. Create one!
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <Link key={p.id} href={`/projects/${p.id}`}>
          <div className="rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition cursor-pointer">
            <h3 className="font-semibold text-black mb-2">{p.name}</h3>
            <p className="text-gray-700 text-sm line-clamp-3 mb-3">{p.description}</p>
            <div className="text-xs text-gray-500">
              Created {new Date(p.created_at).toLocaleDateString()}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
