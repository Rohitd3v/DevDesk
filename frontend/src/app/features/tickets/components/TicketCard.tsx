"use client";

import Link from "next/link";

interface TicketCardProps {
  ticket: {
    id: string;
    title: string;
    description: string;
    status?: string;
    priority?: string;
    created_at?: string;
    project_id?: string;
  };
}

export const TicketCard = ({ ticket }: TicketCardProps) => {
  const status = ticket.status || "open";
  const priority = (ticket.priority || "medium").toLowerCase();

  const priorityBadge = {
    low: "bg-emerald-100 text-emerald-700",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-red-100 text-red-700",
    critical: "bg-purple-100 text-purple-700",
  }[priority as "low" | "medium" | "high" | "critical"] || "bg-gray-100 text-gray-700";

  const statusBadge = {
    open: "bg-blue-100 text-blue-700",
    in_progress: "bg-yellow-100 text-yellow-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-700",
  }[status as "open" | "in_progress" | "resolved" | "closed"] || "bg-gray-100 text-gray-700";

  return (
    <Link href={`/tickets/${ticket.id}`}>
      <div className="rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-black line-clamp-2 flex-1 mr-2">{ticket.title}</h3>
          <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${priorityBadge}`}>
            {priority}
          </span>
        </div>
        
        <p className="text-gray-700 text-sm line-clamp-3 mb-3">{ticket.description}</p>
        
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded-full ${statusBadge}`}>
            {status.replace('_', ' ')}
          </span>
          {ticket.created_at && (
            <span className="text-xs text-gray-500">
              {new Date(ticket.created_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};


