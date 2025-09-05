"use client";

interface Project {
  id: string;
  name: string;
  description: string;
}

export const ProjectsList = ({ projects }: { projects: Project[] }) => {
  if (!projects.length) {
    return <p className="text-gray-700">No projects yet. Create one!</p>;
  }

  return (
    <ul className="divide-y">
      {projects.map((p) => (
        <li key={p.id} className="py-3">
          <h3 className="font-semibold text-black">{p.name}</h3>
          <p className="text-gray-700 text-sm">{p.description}</p>
        </li>
      ))}
    </ul>
  );
};
