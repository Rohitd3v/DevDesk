"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import { useTickets } from "@/app/features/tickets/hooks/useTickets";
import { NewTicketForm } from "@/app/features/tickets/components/NewTicketForm";
import { TicketList } from "@/app/features/tickets/components/TicketList";
import { getProjectById } from "@/app/features/projects/services/projectService";
import { RepositoryLinker } from "@/app/features/github/components/RepositoryLinker";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

function ProjectDetailContent() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);
  
  const { tickets, loading: ticketsLoading, error: ticketsError, addTicket } = useTickets(projectId);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setProjectLoading(true);
        const data = await getProjectById(projectId);
        setProject(data.project);
      } catch (error: any) {
        setProjectError(error.response?.data?.error || "Failed to load project");
        if (error.response?.status === 404) {
          router.push("/projects");
        }
      } finally {
        setProjectLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId, router]);

  if (projectLoading) {
    return (
      <div className="text-black">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h2>
        <p className="text-gray-600 mb-4">{projectError || "The project you're looking for doesn't exist."}</p>
        <Link
          href="/projects"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto text-black">
      {/* Project Header */}
      <div className="mb-8">
        <nav className="text-sm text-gray-600 mb-4">
          <Link href="/projects" className="hover:text-blue-600">Projects</Link>
          <span className="mx-2">/</span>
          <span>{project.name}</span>
        </nav>
        
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
          <p className="text-gray-700 mb-4">{project.description}</p>
          <div className="text-sm text-gray-500">
            Created {new Date(project.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* GitHub Integration Section */}
      <div className="mb-8">
        <RepositoryLinker projectId={project.id} />
      </div>

      {/* Tickets Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Tickets</h2>
          <span className="text-sm text-gray-600">{tickets.length} tickets</span>
        </div>

        <NewTicketForm onCreate={addTicket} />

        {ticketsError && <p className="text-red-600 mb-4">{ticketsError}</p>}

        {ticketsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-white p-4">
                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
              </div>
            ))}
          </div>
        ) : (
          <TicketList tickets={tickets} />
        )}
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <ProtectedRoute>
      <ProjectDetailContent />
    </ProtectedRoute>
  );
}