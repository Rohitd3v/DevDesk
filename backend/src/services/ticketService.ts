import type { TicketCreateBody, TicketUpdateBody } from "../types/ticketTypes.ts";
import { supabase } from "../config/supabaseClient.ts";
import { GitHubRepoService, GitHubSyncService, GitHubService, GitHubTokenService } from "./githubService.ts";

export const TicketService = {
  createTicket: async (ticket: TicketCreateBody) => {
    const { data: newTicket, error } = await supabase.from("tickets").insert([ticket]).select("*").single();

    if (error || !newTicket) return { data: newTicket, error };

    // Check for linked GitHub repos
    const { data: linkedRepos } = await GitHubRepoService.getProjectRepos(ticket.project_id);

    if (linkedRepos && linkedRepos.length > 0 && ticket.created_by) {
      // Use the first linked repo for now (could be configurable in future)
      const repo = linkedRepos[0];

      // Get user's GitHub token
      const { data: tokenData } = await GitHubTokenService.getUserToken(ticket.created_by);

      if (tokenData) {
        try {
          const githubService = new GitHubService(tokenData.access_token);
          const issue = await githubService.createIssue(
            repo.repo_owner,
            repo.repo_name,
            ticket.title,
            ticket.description,
            ticket.priority ? [`priority:${ticket.priority}`] : undefined
          );

          await GitHubSyncService.createSyncRelation(
            newTicket.id,
            issue.id,
            issue.number,
            repo.id,
            "bidirectional"
          );
        } catch (err) {
          console.error("Failed to sync new ticket to GitHub:", err);
          // Don't fail the ticket creation if sync fails
        }
      }
    }

    return { data: newTicket, error: null };
  },

  getTicketsByProject: async (project_id: string) => {
    return supabase.from("tickets").select("*").eq("project_id", project_id);
  },

  getTicketById: async (ticket_id: string) => {
    return supabase.from("tickets").select("*").eq("id", ticket_id).single();
  },

  updateTicket: async (ticket_id: string, updateData: TicketUpdateBody) => {
    const { data: updatedTicket, error } = await supabase
      .from("tickets")
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq("id", ticket_id)
      .select("*")
      .single();

    if (error || !updatedTicket) return { data: updatedTicket, error };

    // Check for sync relation
    const { data: syncData } = await GitHubSyncService.getSyncByTicketId(ticket_id);

    if (syncData && syncData.github_linked_repos && updatedTicket.created_by) {
      const repo = syncData.github_linked_repos;

      // Get user's GitHub token
      const { data: tokenData } = await GitHubTokenService.getUserToken(updatedTicket.created_by);

      if (tokenData) {
        try {
          const githubService = new GitHubService(tokenData.access_token);

          const updates: any = {};
          if (updateData.title) updates.title = updateData.title;
          if (updateData.description) updates.body = updateData.description;
          if (updateData.status) updates.state = updateData.status === 'resolved' || updateData.status === 'closed' ? 'closed' : 'open';
          // Label updates could be more complex, skipping for MVP

          if (Object.keys(updates).length > 0) {
            await githubService.updateIssue(
              repo.repo_owner,
              repo.repo_name,
              syncData.github_issue_number,
              updates
            );
            await GitHubSyncService.updateLastSynced(syncData.id);
          }
        } catch (err) {
          console.error("Failed to sync ticket update to GitHub:", err);
        }
      }
    }

    return { data: updatedTicket, error: null };
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