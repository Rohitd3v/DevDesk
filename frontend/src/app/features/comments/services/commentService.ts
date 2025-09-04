
import apiClient from "@/app/services/apiClient";
export const addComment = async (ticketId: string, content: string) => {
  const { data } = await apiClient.post(`/tickets/${ticketId}/comments`, { content });
  return data;
};

export const getComments = async (ticketId: string) => {
  const { data } = await apiClient.get(`/tickets/${ticketId}/comments`);
  return data;
};

export const getOwnComments = async (ticketId: string) => {
  const { data } = await apiClient.get(`/tickets/${ticketId}/comments/user`);
  return data;
};
