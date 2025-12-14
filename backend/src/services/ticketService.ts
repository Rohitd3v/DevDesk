import type { TicketCreateBody, TicketUpdateBody } from "../types/ticketTypes.ts";
import { supabase } from "../config/supabaseClient.ts";

export const TicketService = {
  createTicket: async (ticket: TicketCreateBody) => {
    return supabase.from("tickets").insert([ticket]).select("*").single();
  },

  getTicketsByProject: async (project_id: string) => {
    return supabase.from("tickets").select("*").eq("project_id", project_id);
  },

  getTicketById: async (ticket_id: string) => {
    return supabase.from("tickets").select("*").eq("id", ticket_id).single();
  },

  updateTicket: async (ticket_id: string, updateData: TicketUpdateBody) => {
    return supabase
      .from("tickets")
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq("id", ticket_id)
      .select("*")
      .single();
  },

  deleteTicket: async (ticket_id: string) => {
    return supabase
      .from("tickets")
      .delete()
      .eq("id", ticket_id)
      .select()
      .single();
  },

  getAllTicketofuser: async (user_id: string) => {
    return supabase
      .from("tickets")
      .select("*")
      .or(`assigned_to.eq.${user_id},created_by.eq.${user_id}`);
  },
};