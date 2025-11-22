
import { useEffect, useState, useCallback } from "react";
import { getTickets, createTicket, updateTicket } from "../services/ticketService";
import { AxiosError } from "axios";
import { Ticket } from "../types";

export const useTickets = (projectId: string) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTickets(projectId);
      setTickets(data.tickets);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || "Failed to load tickets");
      } else if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

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
  }, [fetchTickets]);

  return { tickets, loading, error, fetchTickets, addTicket, editTicket };
};
