import { supabase } from "../config/supabaseClient.ts";

export const TicketCommentService = {
  createComment: async (ticket_id: string, author_id: string, content: string) => {
    return supabase
      .from('ticket_comments')
      .insert([{ ticket_id, author_id, content }])
      .select()
      .single();
  },

  getCommentsByTicketId: async (ticket_id: string) => {
    return supabase
      .from('ticket_comments')
      .select('*')
      .eq('ticket_id', ticket_id)
      .order('created_at', { ascending: true });
  },

  getCommentsByUserId: async (ticket_id: string, author_id: string) => {
    return supabase
      .from('ticket_comments')
      .select('*')
      .eq('ticket_id', ticket_id)
      .eq('author_id', author_id);
  },

  deleteCommentById: async (comment_id: string, ticket_id: string, author_id: string) => {
    return supabase
      .from('ticket_comments')
      .delete()
      .eq('id', comment_id)
      .eq('ticket_id', ticket_id)
      .eq('author_id', author_id)
      .select()
      .single();
  },
};
