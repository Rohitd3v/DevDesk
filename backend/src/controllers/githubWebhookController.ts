import type { Request, Response } from "express";
import { sendResponse } from "../utils/sendResponse.ts";
import { GitHubRepoService, GitHubSyncService } from "../services/githubService.ts";
import { TicketService } from "../services/ticketService.ts";
import { TicketCommentService } from "../services/ticketCommentService.ts";
import { supabase } from "../config/supabaseClient.ts";
import crypto from 'crypto';

// Verify GitHub webhook signature
const verifySignature = (req: Request, secret: string) => {
    const signature = req.headers["x-hub-signature-256"] as string;
    if (!signature) return false;

    const hmac = crypto.createHmac("sha256", secret);
    const digest = "sha256=" + hmac.update(JSON.stringify(req.body)).digest("hex");

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
};

export const handleWebhook = async (req: Request, res: Response) => {
    const event = req.headers["x-github-event"] as string;
    const signature = req.headers["x-hub-signature-256"] as string;

    const payload = req.body;
    const repoId = payload.repository?.id;

    if (!repoId) {
        return sendResponse(res, 400, false, { error: "Missing repository information" });
    }

    try {
        const { data: linkedRepo, error: repoError } = await supabase
            .from('github_linked_repos')
            .select('*')
            .eq('github_repo_id', repoId)
            .single();

        if (repoError || !linkedRepo) {
            return sendResponse(res, 200, true, { message: "Repository not linked, ignoring" });
        }

        if (event === "issues") {
            await handleIssueEvent(payload, linkedRepo);
        } else if (event === "issue_comment") {
            await handleIssueCommentEvent(payload, linkedRepo);
        }

        return sendResponse(res, 200, true, { message: "Webhook processed" });

    } catch (error: any) {
        console.error("Webhook processing error:", error);
        return sendResponse(res, 500, false, { error: error.message });
    }
};

const handleIssueEvent = async (payload: any, linkedRepo: any) => {
    const action = payload.action;
    const issue = payload.issue;

    const { data: syncData } = await GitHubSyncService.getSyncByGitHubIssue(linkedRepo.id, issue.number);

    if (action === "opened" && !syncData) {
        let creatorId = linkedRepo.project_id;
        const { data: project } = await supabase.from('projects').select('owner_id').eq('id', linkedRepo.project_id).single();
        if (project) creatorId = project.owner_id;

        const { data: tokenData } = await supabase
            .from('user_github_tokens')
            .select('user_id')
            .eq('github_user_id', issue.user.id)
            .single();

        if (tokenData) creatorId = tokenData.user_id;

        const { data: newTicket, error } = await TicketService.createTicket({
            project_id: linkedRepo.project_id,
            title: issue.title,
            description: issue.body || "",
            status: "open",
            priority: "medium", // Default
            created_by: creatorId
        });

        if (newTicket) {
            await GitHubSyncService.createSyncRelation(
                newTicket.id,
                issue.id,
                issue.number,
                linkedRepo.id,
                "bidirectional"
            );
        }

    } else if (syncData) { // Edited, closed, reopened
        const updates: any = {};

        if (action === "edited") {
            updates.title = issue.title;
            updates.description = issue.body;
        } else if (action === "closed") {
            updates.status = "closed"; // or resolved
        } else if (action === "reopened") {
            updates.status = "open";
        }

        if (Object.keys(updates).length > 0) {
            await supabase
                .from("tickets")
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq("id", syncData.ticket_id);

            await GitHubSyncService.updateLastSynced(syncData.id);
        }
    }
};

const handleIssueCommentEvent = async (payload: any, linkedRepo: any) => {
    if (payload.action !== "created") return;

    const issue = payload.issue;
    const comment = payload.comment;

    const { data: syncData } = await GitHubSyncService.getSyncByGitHubIssue(linkedRepo.id, issue.number);

    if (syncData) {
        let authorId = null;
        const { data: tokenData } = await supabase
            .from('user_github_tokens')
            .select('user_id')
            .eq('github_user_id', comment.user.id)
            .single();

        if (tokenData) {
            authorId = tokenData.user_id;
        } else {
            return;
        }
        await TicketCommentService.createComment(
            syncData.ticket_id,
            authorId,
            comment.body
        );
    }
};
