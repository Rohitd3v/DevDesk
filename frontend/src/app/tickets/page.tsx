"use client";

import { useState } from "react";
import { useProjects } from "@/app/features/projects/hooks/useProjects";
import { useTickets } from "@/app/features/tickets/hooks/useTickets";
import { NewTicketForm } from "@/app/features/tickets/components/NewTicketForm";
import { TicketList } from "@/app/features/tickets/components/TicketList";

export default function TicketsPage() {
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const { tickets, loading, error, addTicket } = useTickets(selectedProjectId);

  return (
    <div className="p-6 max-w-5xl mx-auto text-black">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold">Tickets</h1>

        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-700">Project</label>
          <select
            className="px-3 py-2 border rounded-xl bg-white text-black"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">Select a project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedProjectId && (
        <NewTicketForm onCreate={addTicket} />
      )}

      {!selectedProjectId && (
        <div className="rounded-xl border border-dashed p-6 text-center text-gray-700 bg-white">
          Select a project to view tickets.
        </div>
      )}

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {selectedProjectId && (
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


