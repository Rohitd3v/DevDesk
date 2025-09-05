
import apiClient from "@/app/services/apiClient";

export const createTicket = async (
  projectId: string,
  ticket: { title: string; description: string; priority: string }
) => {
  const { data } = await apiClient.post(`/ticket/${projectId}/tickets`, ticket);
  return data;
};

export const getTickets = async (projectId: string) => {
  const { data } = await apiClient.get(`/ticket/${projectId}/tickets`);
  return data;
};

export const getTicketById = async (id: string) => {
  const { data } = await apiClient.get(`/ticket/${id}`);
  return data;
};

export const updateTicket = async (
  id: string,
  updates: Partial<{ status: string; priority: string }>
) => {
  const { data } = await apiClient.patch(`/ticket/${id}`, updates);
  return data;
};
