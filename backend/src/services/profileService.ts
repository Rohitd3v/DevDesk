import { supabase } from "../config/supabaseClient.ts";

interface Profile {
  username: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
}

export const ProfileService = {
  getProfileById: async (profileId: string) => {
    return supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, role")
      .eq("id", profileId)
      .single();
  },

  getAllProfiles: async () => {
    return supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, role");
  },
  
  createProfile: async (userId: string, profile: Profile) => {
    return supabase
      .from("profiles")
      .insert([{ id: userId, ...profile }])
      .select("id, username, full_name, avatar_url, role")
      .single();
  },

  updateProfile: async (profileId: string, profile: Partial<Profile>) => {
    return supabase
      .from("profiles")
      .update(profile)
      .eq("id", profileId)
      .select("id, username, full_name, avatar_url, role")
      .single();
  },

  deleteProfile: async (profileId: string) => {
    return supabase
      .from("profiles")
      .delete()
      .eq("id", profileId);
  },
};
