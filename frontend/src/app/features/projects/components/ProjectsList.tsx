"use client";

interface Project {
  id: string;
  name: string;
  description: string;
}

export const ProjectsList = ({ projects }: { projects: Project[] }) => {
  if (!projects.length) {
    return <p className="text-gray-500">No projects yet. Create one!</p>;
  }

  return (
    <ul className="divide-y">
      {projects.map((p) => (
        <li key={p.id} className="py-3">
          <h3 className="font-semibold">{p.name}</h3>
          <p className="text-gray-600 text-sm">{p.description}</p>
        </li>
      ))}
    </ul>
  );
};
