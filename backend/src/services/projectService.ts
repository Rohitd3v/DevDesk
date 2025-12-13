import { supabase } from "../config/supabaseClient.ts";

export const ProjectService = {
  getProjectsByUser: async (userId: string) => {
    return supabase
      .from("projects")
      .select("id, name, description, created_at")
      .eq("owner_id", userId);
  },

  getProjectById: async (projectId: string, userId: string) => {
    return supabase
      .from("projects")
      .select("*")
      .eq("owner_id", userId)
      .eq("id", projectId)
      .single();
  },

  createProject: async (name: string, description: string, userId: string) => {
    return supabase
      .from("projects")
      .insert([{ name, description, owner_id: userId }])
      .select()
      .single();
  },

  updateProject: async (projectId: string, userId: string, name: string, description: string) => {
    return supabase
      .from('projects')
      .update({ name, description })
      .eq("id", projectId)
      .eq("owner_id", userId)
      .select()
      .single();
  },

  deleteProject: async (projectId: string, userId: string) => {
    return supabase
      .from('projects')
      .delete()
      .eq("id", projectId)
      .eq("owner_id", userId);
  },
};
