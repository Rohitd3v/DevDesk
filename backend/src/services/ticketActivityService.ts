import { supabase } from "../config/supabaseClient.ts";

export const TicketActivityService = {
  createActivity: async (ticket_id: string, actor_id: string, action: string, details: object) => {
    return supabase
      .from("ticket_activity")
      .insert([{ ticket_id, actor_id, action, details }])
      .select()
      .single();
  },

  getActivitiesByTicketId: async (ticket_id: string) => {
    return supabase
      .from("ticket_activity")
      .select("*")
      .eq("ticket_id", ticket_id)
      .order("created_at", { ascending: true });
  },

  getActivitiesByUserId: async (ticket_id: string, actor_id: string) => {
    return supabase
      .from("ticket_activity")
      .select("*")
      .eq("ticket_id", ticket_id)
      .eq("actor_id", actor_id)
      .order("created_at", { ascending: true });
  },

  deleteActivityById: async (activity_id: string, ticket_id: string, actor_id: string) => {
    return supabase
      .from("ticket_activity")
      .delete()
      .eq("id", activity_id)
      .eq("ticket_id", ticket_id)
      .eq("actor_id", actor_id)
      .select()
      .single();
  },
};
