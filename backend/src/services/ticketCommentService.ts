import { supabase } from "../config/supabaseClient.js";

import { GitHubSyncService, GitHubService, GitHubTokenService } from "./githubService.js";

export const TicketCommentService = {
  createComment: async (ticket_id: string, author_id: string, content: string) => {
    const { data: comment, error } = await supabase
      .from('ticket_comments')
      .insert([{ ticket_id, author_id, content }])
      .select()
      .single();

    if (error || !comment) return { data: comment, error };

    // Sync to GitHub
    try {
      const { data: syncData } = await GitHubSyncService.getSyncByTicketId(ticket_id);
      if (syncData && syncData.github_linked_repos) {
        const { data: tokenData } = await GitHubTokenService.getUserToken(author_id);
        if (tokenData) {
          const githubService = new GitHubService(tokenData.access_token);
          await githubService.addComment(
            syncData.github_linked_repos.repo_owner,
            syncData.github_linked_repos.repo_name,
            syncData.github_issue_number,
            content
          );
        }
      }
    } catch (err) {
      console.error("Failed to sync comment to GitHub:", err);
    }

    return { data: comment, error: null };
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
