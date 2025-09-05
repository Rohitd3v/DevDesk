"use client";

interface TicketCardProps {
  ticket: {
    id: string;
    title: string;
    description: string;
    status?: string;
    priority?: string;
  };
}

export const TicketCard = ({ ticket }: TicketCardProps) => {
  const status = ticket.status || "open";
  const priority = (ticket.priority || "medium").toLowerCase();

  const priorityBadge = {
    low: "bg-emerald-100 text-emerald-700",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-red-100 text-red-700",
  }[priority as "low" | "medium" | "high"] || "bg-gray-100 text-gray-700";

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm hover:shadow transition">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-black truncate">{ticket.title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${priorityBadge}`}>{priority}</span>
      </div>
      <p className="text-gray-700 text-sm line-clamp-3">{ticket.description}</p>
      <div className="mt-3 text-xs text-gray-600 capitalize">Status: {status}</div>
    </div>
  );
};


