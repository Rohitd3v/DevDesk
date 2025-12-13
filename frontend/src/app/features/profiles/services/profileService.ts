import apiClient from "@/app/services/apiClient";

interface ProfileData {
  username: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
}

export const ProfileService = {
  getProfileById: async (id: string) => {
    const { data } = await apiClient.get(`/profiles/${id}`);
    return data;
  },

  getAllProfiles: async () => {
    const { data } = await apiClient.get("/profiles");
    return data;
  },

  createProfile: async (profileData: ProfileData) => {
    const { data } = await apiClient.post("/profiles", profileData);
    return data;
  },

  updateProfile: async (id: string, profileData: Partial<ProfileData>) => {
    const { data } = await apiClient.patch(`/profiles/${id}`, profileData);
    return data;
  },

  deleteProfile: async (id: string) => {
    const { data } = await apiClient.delete(`/profiles/${id}`);
    return data;
  },
};