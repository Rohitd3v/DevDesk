import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import apiClient from "@/app/services/apiClient";
import { Ticket } from "../types";

export const useAllTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get("/ticket");
      setTickets(data.tickets || []);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error || "Failed to load tickets");
      } else if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTickets();
  }, []);

  return { tickets, loading, error, refetch: fetchAllTickets };
};