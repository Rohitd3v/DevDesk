
import apiClient from "@/app/services/apiClient";

export const createProfile = async (profile: {
  username: string;
  full_name: string;
  avatar_url?: string;
  role: string;
}) => {
  const { data } = await apiClient.post("/profiles", profile);
  return data;
};

export const getProfiles = async () => {
  const { data } = await apiClient.get("/profiles");
  return data;
};

export const getProfileById = async (id: string) => {
  const { data } = await apiClient.get(`/profiles/${id}`);
  return data;
};

export const updateProfile = async (id: string, updates: Partial<{ full_name: string; role: string }>) => {
  const { data } = await apiClient.patch(`/profiles/${id}`, updates);
  return data;
};
