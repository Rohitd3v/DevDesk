import { supabase } from "../config/supabaseClient.ts";

export const NotificationService = {
  getNotificationsByUser: async (userId: string) => {
    return supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
  },

  createNotification: async (userId: string, message: string, channel: string) => {
    return supabase
      .from("notifications")
      .insert([{ user_id: userId, message, channel }])
      .select()
      .single();
  },

  markAsRead: async (notificationId: string, userId: string) => {
    return supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)
      .eq("user_id", userId)
      .select()
      .single();
  },

  markAllAsRead: async (userId: string) => {
    return supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .select();
  },
};
