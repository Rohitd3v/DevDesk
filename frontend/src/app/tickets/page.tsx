"use client";

import { useState } from "react";
import { useProjects } from "@/app/features/projects/hooks/useProjects";
import { useTickets } from "@/app/features/tickets/hooks/useTickets";
import { useAllTickets } from "@/app/features/tickets/hooks/useAllTickets";
import { NewTicketForm } from "@/app/features/tickets/components/NewTicketForm";
import { TicketList } from "@/app/features/tickets/components/TicketList";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import Link from "next/link";

function TicketsContent() {
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const { tickets: projectTickets, loading: projectLoading, error: projectError, addTicket } = useTickets(selectedProjectId);
  const { tickets: allTickets, loading: allLoading, error: allError } = useAllTickets();

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  
  // Use project tickets if a project is selected, otherwise use all tickets
  const tickets = selectedProjectId ? projectTickets : allTickets;
  const loading = selectedProjectId ? projectLoading : allLoading;
  const error = selectedProjectId ? projectError : allError;

  return (
    <div className="max-w-6xl mx-auto text-black">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold">All Tickets</h1>

        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-700">Filter by Project:</label>
          <select
            className="px-3 py-2 border rounded-xl bg-white text-black"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedProjectId && selectedProject && (
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900">Viewing tickets for: {selectedProject.name}</h3>
                <p className="text-sm text-blue-700">{selectedProject.description}</p>
              </div>
              <Link
                href={`/projects/${selectedProjectId}`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View Project →
              </Link>
            </div>
          </div>
        </div>
      )}

      {selectedProjectId && (
        <NewTicketForm onCreate={addTicket} />
      )}

      {!selectedProjectId && projects.length === 0 && (
        <div className="rounded-xl border border-dashed p-6 text-center text-gray-700 bg-white">
          <h3 className="font-medium mb-2">No projects found</h3>
          <p className="text-sm mb-4">Create a project first to start managing tickets.</p>
          <Link
            href="/projects"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create Project
          </Link>
        </div>
      )}

      {!selectedProjectId && projects.length > 0 && (
        <div className="rounded-xl border border-dashed p-6 text-center text-gray-700 bg-white">
          Select a project to view and create tickets, or view all tickets across projects.
        </div>
      )}

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {(selectedProjectId || (!selectedProjectId && projects.length > 0)) && (
        <>
          {loading ? (
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
        </>
      )}
    </div>
  );
}

export default function TicketsPage() {
  return (
    <ProtectedRoute>
      <TicketsContent />
    </ProtectedRoute>
  );
}


