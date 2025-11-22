import { Response } from "express";
import { sendResponse } from "../utils/sendResponse.js";
import { TicketCommentService } from "../services/ticketCommentService.js";
import type { AuthenticatedRequest } from "../types/AuthenticatedRequest.js";


export const createComment = async (req: AuthenticatedRequest, res: Response) => {

  const { content } = req.body;
  const ticket_id = req.params.ticket_id;
  const userId = req.user?.id;

  if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" });
  if (!ticket_id) return sendResponse(res, 400, false, { error: "Ticket ID is required" });

  const { data, error } = await TicketCommentService.createComment(ticket_id, userId, content);

  if (error) return sendResponse(res, 500, false, { error: error.message });
  return sendResponse(res, 201, true, { comment: data });
};

// GET all comments for ticket
export const getcommentbyticketId = async (req: AuthenticatedRequest, res: Response) => {

  const ticket_id = req.params.ticket_id;
  if (!ticket_id) return sendResponse(res, 400, false, { error: "Ticket ID is required" });

  const { data, error } = await TicketCommentService.getCommentsByTicketId(ticket_id);

  if (error) return sendResponse(res, 500, false, { error: error.message });
  if (!data || data.length === 0) return sendResponse(res, 404, false, { message: "No comments found" });

  return sendResponse(res, 200, true, { comments: data });
};

// GET all comments for a ticket by current user
export const getallCommentbyUserId = async (req: AuthenticatedRequest, res: Response) => {

  const ticket_id = req.params.ticket_id;
  const userId = req.user?.id;

  if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" });
  if (!ticket_id) return sendResponse(res, 400, false, { error: "Ticket ID is required" });

  const { data, error } = await TicketCommentService.getCommentsByUserId(ticket_id, userId);

  if (error) return sendResponse(res, 500, false, { error: error.message });
  if (!data || data.length === 0) return sendResponse(res, 404, false, { message: "No comments found for this user" });

  return sendResponse(res, 200, true, { comments: data });
};

// DELETE a comment
export const DeleteCommentbyId = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { ticket_id, comment_id } = req.params;

  if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" });
  if (!ticket_id) return sendResponse(res, 400, false, { error: "Ticket ID is required" });
  if (!comment_id) return sendResponse(res, 400, false, { error: "Comment ID is required" });

  const { data, error } = await TicketCommentService.deleteCommentById(comment_id, ticket_id, userId);

  if (error) return sendResponse(res, 500, false, { error: error.message });
  if (!data) return sendResponse(res, 404, false, { message: "Comment not found or not allowed" });

  return sendResponse(res, 200, true, { deleted: data });
};

