"use client";

interface Project {
  id: string;
  name: string;
  description: string;
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
    <ul className="divide-y rounded-xl overflow-hidden bg-white border shadow-sm">
      {projects.map((p) => (
        <li key={p.id} className="p-4">
          <h3 className="font-semibold text-black">{p.name}</h3>
          <p className="text-gray-700 text-sm">{p.description}</p>
        </li>
      ))}
    </ul>
  );
};
