
import apiClient from "@/app/services/apiClient";

export const createTicket = async (
  projectId: string,
  ticket: { title: string; description: string; priority: string }
) => {
  const { data } = await apiClient.post(`/projects/${projectId}/tickets`, ticket);
  return data;
};

export const getTickets = async (projectId: string) => {
  const { data } = await apiClient.get(`/projects/${projectId}/tickets`);
  return data;
};

export const getTicketById = async (id: string) => {
  const { data } = await apiClient.get(`/tickets/${id}`);
  return data;
};

export const updateTicket = async (
  id: string,
  updates: Partial<{ status: string; priority: string }>
) => {
  const { data } = await apiClient.patch(`/tickets/${id}`, updates);
  return data;
};
