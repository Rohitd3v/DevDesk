import apiClient from "@/app/services/apiClient";

export const createComment = async (ticketId: string, content: string) => {
  const { data } = await apiClient.post(`/ticketcomment/${ticketId}`, { content });
  return data;
};

export const getComments = async (ticketId: string) => {
  const { data } = await apiClient.get(`/ticketcomment/${ticketId}`);
  return data;
};

export const deleteComment = async (ticketId: string, commentId: string) => {
  const { data } = await apiClient.delete(`/ticketcomment/${ticketId}/${commentId}`);
  return data;
};