"use client";

import { TicketCard } from "./TicketCard";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status?: string;
  priority?: string;
}

export const TicketList = ({ tickets }: { tickets: Ticket[] }) => {
  if (!tickets.length) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center text-gray-700 bg-white">
        No tickets yet.
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tickets.map((t) => (
        <TicketCard key={t.id} ticket={t} />
      ))}
    </div>
  );
};
