
import { useEffect, useState } from "react";
import { getTickets, createTicket, updateTicket } from "../services/ticketService";

export const useTickets = (projectId: string) => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTickets(projectId);
      setTickets(data.tickets);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const addTicket = async (ticket: { title: string; description: string; priority: string }) => {
    await createTicket(projectId, ticket);
    await fetchTickets();
  };

  const editTicket = async (id: string, updates: Partial<{ status: string; priority: string }>) => {
    await updateTicket(id, updates);
    await fetchTickets();
  };

  useEffect(() => {
    fetchTickets();
  }, [projectId]);

  return { tickets, loading, error, fetchTickets, addTicket, editTicket };
};
