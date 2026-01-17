import { sendResponse } from "../utils/sendResponse.js";
import { TicketActivityService } from "../services/ticketActivityService.js";
import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/AuthenticatedRequest.js";
/**
 * CREATE ticket activity */

export const createactivity = async (req: AuthenticatedRequest, res: Response) => {

  const { ticket_id } = req.params;
  const { action, details } = req.body;
  const userId = req.user?.id;

  if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" });
  if (!ticket_id) return sendResponse(res, 400, false, { error: "Ticket ID is required" });

  const { data, error } = await TicketActivityService.createActivity(ticket_id, userId, action, details);

  if (error) return sendResponse(res, 500, false, { error: error.message });

  return sendResponse(res, 201, true, { activity: data });
};

/**
 * GET all activities for a ticket
 */
export const getActivitiesbytId = async (req: AuthenticatedRequest, res: Response) => {
  const { ticket_id } = req.params;
  if (!ticket_id) return sendResponse(res, 400, false, { error: "Ticket ID is required" });

  const { data, error } = await TicketActivityService.getActivitiesByTicketId(ticket_id);

  if (error) return sendResponse(res, 500, false, { error: error.message });
  if (!data || data.length === 0) return sendResponse(res, 404, false, { message: "No activities found" });

  return sendResponse(res, 200, true, { activities: data });
};

/**
 * GET all activities for a ticket by current user
 */
export const getAllActivitiesByuser = async (req: AuthenticatedRequest, res: Response) => {
  const { ticket_id } = req.params;
  const userId = req.user?.id;

  if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" });
  if (!ticket_id) return sendResponse(res, 400, false, { error: "Ticket ID is required" });

  const { data, error } = await TicketActivityService.getActivitiesByUserId(ticket_id, userId);

  if (error) return sendResponse(res, 500, false, { error: error.message });
  if (!data || data.length === 0) return sendResponse(res, 404, false, { message: "No activities found for this user" });

  return sendResponse(res, 200, true, { activities: data });
};

/**
 * DELETE activity (only allowed for creator)
 */
export const DelActivitybyId = async (req: AuthenticatedRequest, res: Response) => {
  const { ticket_id, activity_id } = req.params;
  const userId = req.user?.id;

  if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" });
  if (!ticket_id) return sendResponse(res, 400, false, { error: "Ticket ID is required" });
  if (!activity_id) return sendResponse(res, 400, false, { error: "Activity ID is required" });

  const { data, error } = await TicketActivityService.deleteActivityById(activity_id, ticket_id, userId);

  if (error) return sendResponse(res, 500, false, { error: error.message });
  if (!data) return sendResponse(res, 404, false, { message: "Activity not found or not allowed" });

  return sendResponse(res, 200, true, { deleted: data });
};
